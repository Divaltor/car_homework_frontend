import { Layout as L } from 'antd';
import Header from '@/layouts/Header';

export default function Layout(props: any) {

  return (
    <L className='layout'>
      <Header />
      <L.Content style={{ padding: '50px 50px' }}>
        <div className='site-content'>{props.children}</div>
      </L.Content>
      <L.Footer style={{ textAlign: 'center' }}>Divaltor</L.Footer>
    </L>
  );
}
