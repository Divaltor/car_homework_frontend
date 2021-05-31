import { Button } from 'antd';
import { history } from 'umi';

interface ILoginProps {
  isLogged: boolean,
  onLogout: () => void
}

export default function LoginButton(props: ILoginProps) {

  if (props.isLogged) {
    return <Button type='primary' danger onClick={props.onLogout}>Log out</Button>;
  }

  return <Button type='primary' onClick={() => history.push('/login')}>Log in</Button>;
}
