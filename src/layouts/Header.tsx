import React, { useContext } from 'react';
import { Col, Layout, Menu, Row, Space, Tag, Typography } from 'antd';
import { UserInfo, UserLogged } from './App';
import { history } from 'umi';
import './App.less';
import LoginButton from '@/Components/LoginButton';
import Jwt from '@/utils/jwt';

export default function Header() {
  const { authenticated, setAuthenticated } = useContext(UserLogged);
  const { balance, discount, setDiscount } = useContext(UserInfo);

  let username;

  if (authenticated) {
    username = new Jwt(localStorage.getItem('token') as string).decoded.refresh.username;
  }

  function handleLogoutClick() {
    localStorage.removeItem('token');
    setAuthenticated(false);
    setDiscount(false);
  }

  return (
    <Layout.Header>
      <Row>
        <Col>
          <Menu theme='dark' mode='horizontal'>
            <Menu.Item key='index'><Typography.Link onClick={() => history.push('/')}>Main
              page</Typography.Link></Menu.Item>
            <Menu.Item key='users'><Typography.Link
              onClick={() => history.push('/users')}>Users</Typography.Link></Menu.Item>
          </Menu>
        </Col>
        <Col push={16 }>
          <Space direction='horizontal'>
            {discount && <Tag color='orange'>VIP</Tag>}
            {username && <Typography.Text className='title-color'>{username}</Typography.Text>}
            {authenticated && <Typography.Text className='title-color'>Balance: {balance}$</Typography.Text>}
            <LoginButton isLogged={authenticated} onLogout={handleLogoutClick} />
          </Space>
        </Col>
      </Row>
    </Layout.Header>
  );
}
