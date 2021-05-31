import Layout from '@/layouts/Layout';
import { useContext, useEffect, useState } from 'react';
import { IRouteComponentProps } from 'umi';
import axios from 'axios';
import { Button, DatePicker, Image, notification, Skeleton, Space, Typography } from 'antd';
import { UserInfo } from '@/layouts/App';
import moment, { Moment } from 'moment';
import { RangeValue } from 'rc-picker/lib/interface';
import Price from '@/Components/Price';
import Discount from '@/utils/discount';

export default function Vehicles(props: IRouteComponentProps) {

  const [data, setData] = useState<IVehicleRent>();
  const [loading, setLoading] = useState(false);
  const { setBalance, discount } = useContext(UserInfo);
  const [dates, setDates] = useState<{ start: Moment, end: Moment }>();
  const [cardDiscount, setCardDiscount] = useState(false);

  const [discountValue, setDiscountValue] = useState(0);

  useEffect(() => {
    setLoading(true);

    // @ts-ignore
    const vehicleId: string = props.match.params.id;

    axios.get(`/vehicles-rent/${vehicleId}/`)
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => setLoading(false));

  }, []);

  const openNotification = (message: string, error: boolean = false) => {
    const args = { message: message };

    error ? notification.error(args) : notification.success(args);
  };

  const onDateChange = (dates: RangeValue<Moment>, dateString: [string, string]) => {
    // @ts-ignore

    if (dates === null) {
      setCardDiscount(false);
      setDiscountValue(0);

      return;
    }

    // @ts-ignore
    const [start, end]: [moment.Moment, moment.Moment] = dates;

    setDates({ start: start, end: end });

    const diff = end.diff(start, 'days') + 1;

    const newDiscount = new Discount(diff).getDiscount();

    setDiscountValue(newDiscount);
    setCardDiscount(true);
  };

  const handleRentCar = () => {

    if (dates === undefined) {
      return;
    }

    // @ts-ignore
    const vehicleId = props.match.params.id;

    axios.post(`/api/rent/${vehicleId}`, {
      start: dates.start,
      end: dates.end,
    })
      .then((response) => {
        // @ts-ignore
        const respData: IVehicleRent & { balance: number } = response.data;

        const { balance, ...newData } = respData;

        // @ts-ignore
        setData(newData);
        setBalance(balance);

        openNotification('Car has been rented');
      })
      .catch((error) => {
        openNotification('Unexpected error', true);
      });
  };

  return (
    <Layout>
      <Skeleton active loading={loading} />
      {data && (
        <Space direction='vertical' align='center' style={{ width: '100%' }}>
          <Image src={data.picture} height={300} />
          <Typography.Title level={3}>{data.vehicle.brand} {data.vehicle.model}</Typography.Title>
          {data.count === 0 ? (
            <Typography.Title level={4} type='danger'>Out of stock</Typography.Title>
          ) : (
            <Typography.Title level={4} type='secondary'>Available in stock: {data.count}</Typography.Title>
          )}
          <Typography.Text><b>Seats: </b>{data.vehicle.seats}</Typography.Text>
          <Typography.Text><b>Vehicle type:</b> {data.vehicle.type}</Typography.Text>
          <Typography.Text><b>Fuel type: </b>{data.vehicle.fuel_type}</Typography.Text>
          <Typography.Paragraph><b>Price:</b> <Price price={data.price} discount={discount ? discount : cardDiscount}
                                                     discountValue={discount ? 15 : discountValue} /></Typography.Paragraph>
          <DatePicker.RangePicker onChange={onDateChange}
                                  disabledDate={(current) => current && current < moment().endOf('day')} />
          <Button type='primary' disabled={data.count === 0} onClick={handleRentCar}>Rent car</Button>
        </Space>
      )}
    </Layout>
  );
}
