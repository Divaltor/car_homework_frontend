import { Alert, Button, Form, Input, Layout } from 'antd';
import { history } from 'umi';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import React, { useContext, useState } from 'react';
import './login.less';
import axios from 'axios';
import { UserInfo, UserLogged } from '@/layouts/App';


export default function Login() {

  const [loginError, setLoginError] = useState({ text: '', error: false });
  const { setAuthenticated } = useContext(UserLogged);
  const { setDiscount, discount } = useContext(UserInfo);

  function onFinish(values: { username: string, password: string }) {
    axios.post('/api/token', {
      'username': values.username,
      'password': values.password,
    }).then((response) => {
      localStorage.setItem('token', JSON.stringify(response.data));
      setAuthenticated(true);
      setDiscount(!discount);
      history.push('/');
    }).catch((error) => {
      setLoginError({
        text: error?.response?.data?.detail ?? 'Request timeout',
        error: true,
      });
    });
  }

  return (
    <Layout className='full-content' style={{ justifyItems: 'center', alignItems: 'center', alignContent: 'center' }}>
      <Layout.Content style={{ margin: 'auto', flex: 'none' }}>
        {loginError.error && <Alert message={loginError.text} type='error' showIcon style={{ marginBottom: '1rem' }} />}
        <Form style={{ minWidth: '300px' }} onFinish={onFinish} initialValues={{ remember: true }}>
          <Form.Item name='username' rules={[
            { required: true, message: 'Please enter your username!' },
          ]}>
            <Input
              placeholder='Enter your username'
              prefix={<UserOutlined className='site-form-item-icon' />}
            />
          </Form.Item>
          <Form.Item name='password' rules={[
            { required: true, message: 'Please enter your password!' },
          ]}>
            <Input.Password
              placeholder='Enter your password'
              prefix={<LockOutlined className='site-form-item-icon' />}
            />
          </Form.Item>

          <Form.Item className='text-center' style={{ margin: 'auto', maxWidth: '50%' }}>
            <Button block type='primary' htmlType='submit'>Log in</Button>
          </Form.Item>
        </Form>
      </Layout.Content>

    </Layout>
  );
}
