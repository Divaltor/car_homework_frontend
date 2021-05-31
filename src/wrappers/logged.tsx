import { useContext } from 'react';
import { UserLogged } from '@/layouts/App';
import { history, IRouteComponentProps } from 'umi';

export default function(props: IRouteComponentProps) {
  const { authenticated } = useContext(UserLogged);

  if (authenticated) {
    history.goBack();
  }

  return props.children;
}
