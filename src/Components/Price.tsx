import { Space, Typography } from 'antd';

export default function Price(props: { price: number, discount: boolean, discountValue: number }) {

  return (
    props.discount ? (
      <Space direction='horizontal'>
        <Typography.Text delete>{props.price}</Typography.Text>
        <Typography.Title level={4} type='danger'>{(props.price - props.price * (props.discountValue / 100)).toFixed(2)}</Typography.Title>
      </Space>
    ) : (
      <Typography.Text>{props.price}</Typography.Text>
    )
  )
}
