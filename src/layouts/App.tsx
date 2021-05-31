import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Jwt from '@/utils/jwt';

axios.defaults.baseURL = 'http://localhost:8001';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.timeout = 3000;

const UserLogged = React.createContext({
  authenticated: false,
  setAuthenticated: (auth: boolean) => {
  },
});

const UserInfo = React.createContext({
  balance: 0,
  setBalance: (balance: number) => {
  },
  discount: false,
  setDiscount: (discount: boolean) => {
  },
});

export default function App(props: any) {
  const [authenticated, setAuthenticated] = useState(!!localStorage.getItem('token'));
  const [balance, setBalance] = useState(0);
  const [discount, setDiscount] = useState(false);

  if (authenticated) {
    const jwt = new Jwt(localStorage.getItem('token') as string);

    const now = new Date();

    // @ts-ignore
    if (jwt.decoded.refresh.exp && new Date(jwt.decoded.refresh.exp * 1000) < now) {
      localStorage.removeItem('token');
      setAuthenticated(false);
    }

    if (authenticated) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwt.encoded.access}`;

      axios.interceptors.response.use(undefined, async error => {

        if (error.response?.status !== 401 || !error.response?.data?.detail?.includes('token')) {
          return Promise.reject(error);
        }

        const tokenResponse = await axios.post('/api/token/refresh', {
          'refresh': jwt.encoded.refresh,
        });

        error.response.config.headers['Authorization'] = `Bearer ${tokenResponse.data.access}`;

        jwt.encoded.access = tokenResponse.data.access;
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokenResponse.data.access}`;

        localStorage.setItem('token', JSON.stringify(jwt.encoded));

        return axios.request(error.response.config);
      });
    }
  }

  useEffect(() => {
    if (authenticated) {
      axios.get('/api/users/current')
        .then((response) => {
          const data: IUser = response.data;

          setBalance(data.money);
        });

      axios.get('/api/users/current/discount')
        .then((response) => {
          const discount: boolean = response.data.discount;

          setDiscount(discount);
        });
    }
  }, [balance, discount]);

  return (
    <UserLogged.Provider value={{ authenticated, setAuthenticated }}>
      <UserInfo.Provider value={{ balance, setBalance, discount, setDiscount }}>
        {props.children}
      </UserInfo.Provider>
    </UserLogged.Provider>
  );

}

export { UserLogged, UserInfo };
