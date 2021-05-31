import { useContext } from 'react';
import { UserLogged } from '@/layouts/App';
import { Button, Result, Space } from 'antd';
import { history } from 'umi';

export default (props: any) => {
  const { authenticated } = useContext(UserLogged);

  if (!authenticated) {
    return (
      <Result
        status='403'
        title='403'
        subTitle='Sorry, you are not authorized to access this page.'
        extra={
          <Space direction='horizontal'>
            <Button type='default' onClick={() => history.push('/')}>Back Home</Button>
            <Button type='primary' onClick={() => history.push('/login')}>Log in</Button>
          </Space>
        }
      />
    );
  }

return props.children;
}
