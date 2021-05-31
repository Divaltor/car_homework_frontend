import { history, IRouteComponentProps } from 'umi';
import Layout from '@/layouts/Layout';
import {
  Badge,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  notification,
  Popconfirm,
  Space,
  Table,
  Typography,
} from 'antd';
import { useForm } from 'antd/lib/form/Form';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './users.less';
import Jwt from '@/utils/jwt';
import { QuestionCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { PresetStatusColorType } from 'antd/lib/_util/colors';


interface Item extends IUser {
  key: string
}

interface NestedItem {
  key: number | string,
  vehicle_id: number,
  start_date: string,
  end_date: string,
  status: PresetStatusColorType,
  status_text: string
}


interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text';
  record: Item;
  required: boolean
  index: number;
  children: React.ReactNode;
}


interface UserCreateFormProps {
  visible: boolean;
  onCreate: (values: IUser) => void;
  onCancel: () => void;
}

const UserCreateForm: React.FC<UserCreateFormProps> = (
  {
    visible,
    onCreate,
    onCancel,
  }) => {
  const [form] = useForm();

  return (
    <Modal
      visible={visible}
      title='Create a new user'
      okText='Create'
      cancelText='Cancel'
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then(values => {
            form.resetFields();
            onCreate(values);
          })
          .catch(info => {
            console.log(`Validate failed: ${info}`);
          });
      }}
    >
      <Form
        form={form}
        layout='vertical'
      >
        <Form.Item
          name='username'
          label='Username'
          rules={[{ required: true, message: 'Please input the username' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name='email'
          label='Email'
          rules={[{ required: true, message: 'Please input the email', type: 'email' }]}
        >
          <Input type='email' />
        </Form.Item>
        <Form.Item
          name='phone_number'
          label='Phone'
          rules={[{ required: true, message: 'Please input the phone' }]}
        >
          <Input type='tel' />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const EditableCell: React.FC<EditableCellProps> = (
  {
    editing,
    dataIndex,
    title,
    inputType,
    record,
    required,
    index,
    children,
    ...restProps
  }) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: required,
              message: `Please input ${dataIndex}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (children)}
    </td>
  );
};


export default function Users(props: IRouteComponentProps) {
  const [form] = useForm();
  const [data, setData] = useState<Item[]>([]);
  const [nestedData, setNestedData] = useState<Record<string, NestedItem[]>>({});
  const [editingKey, setEditingKey] = useState('');
  const [visible, setVisible] = useState(false);

  const jwt = new Jwt(localStorage.getItem('token') as string);

  const expandedRowRender = (record: Item) => {
    const customerData = nestedData[record.key] === undefined ? [] : [...nestedData[record.key]];

    const columns = [
      {
        title: 'Vehicle ID', dataIndex: 'vehicle_id', render: (checked: any, record: NestedItem) => {
          return (
            <Typography.Link onClick={() => history.push(`/vehicle/${record.vehicle_id}/rent`)}>
              {record.vehicle_id}
            </Typography.Link>
          );
        },
      },
      { title: 'Start date', dataIndex: 'start_date' },
      { title: 'End date', dataIndex: 'end_date' },
      {
        title: 'Status', dataIndex: 'status', render: (checked: any, record: NestedItem) => {
          return (
            <span>
              <Badge status={record.status} />
              {record.status_text}
            </span>
          );
        },
      },
      {
        title: 'Action', dataIndex: 'actions', render: (checked: any, record: NestedItem) => (
          <Space size='middle'>
            <Popconfirm title='Are you sure?' onConfirm={() => {
              axios.delete(`/rental-events/${record.key}/`)
                .then((response) => {
                  const newData = { ...nestedData };

                  for (const [key, value] of Object.entries(newData)) {
                    const index = value.findIndex(item => item.key === record.key);

                    if (index !== -1) {
                      value.splice(index, 1);

                      newData[key] = value;
                    }
                  }

                  setNestedData(newData);

                  openNotification('Successfully delete the rented car');
                }).catch((error) => openNotification('Unexpected error', true));
            }}><a>Delete</a></Popconfirm>
          </Space>
        ),
      },
    ];

    return <Table columns={columns} dataSource={customerData} pagination={false} />;
  };

  const onExpand = (expanded: boolean, record: Item) => {
    axios.get('/rental-events/', {
      params: {
        user_id: record.id,
        get_all: true,
      },
    }).then((response) => {
      const respData: IRentalEvent[] = response.data;

      const convertedData = respData.map((item: IRentalEvent) => {
        const end_date = moment(item.end_date);

        const now = moment();

        const diff = now.diff(end_date);

        const dateFormat = 'YYYY:MM:DD HH:mm:ss';

        return {
          vehicle_id: item.vehicle_rent,
          key: item.id,
          start_date: moment(item.start_date).format(dateFormat),
          end_date: moment(item.end_date).format(dateFormat),
          status_text: diff > 0 ? 'Rental time is up' : 'Active',
          status: diff > 0 ? 'error' : 'success',
        };
      });

      const newData = { ...nestedData };

      // @ts-ignore
      newData[record.key] = convertedData;

      setNestedData(newData);
    });

  };

  const openNotification = (message: string, error: boolean = false) => {
    const args = { message: message };

    error ? notification.error(args) : notification.success(args);
  };

  const onCreate = async (values: any) => {
    try {
      const response: IUser = (await axios.post('/users/', values)).data;

      const newData = [...data];

      newData.push({ key: String(response.id), ...response });
      setData(newData);

      setVisible(false);
      openNotification('Successfully created user');
    } catch (err) {
      openNotification(err?.response?.data, true);
    }
  };

  useEffect(() => {
    axios.get('/users/')
      .then((response) => {
        const data: PageResponse<IUser> = response.data;

        setData(data.results.map((user: IUser) => {
          return { key: String(user.id), ...user };
        }));
      });

  }, []);

  const isEditing = (item: Item) => item.key === editingKey;

  const edit = (item: Partial<Item> & { key: React.Key }) => {
    form.setFieldsValue({ username: '', email: '', phone_number: '', money: 0, ...item });
    setEditingKey(item.key);
  };

  const deleteItem = async (key: React.Key) => {
    const newData = [...data];
    const index = newData.findIndex(item => key === item.key);

    if (index !== -1) {
      try {
        await axios.delete(`/users/${key}/`);

        newData.splice(index, 1);

        setData(newData);
        openNotification('Successfully delete');
      } catch (err) {
        openNotification('Unexpected error', true);
      }
    }
  };

  const cancel = () => setEditingKey('');

  const save = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as Item;

      const newData = [...data];
      const index = newData.findIndex(item => key === item.key);

      if (index !== -1) {
        const item = newData[index];

        try {
          await axios.put(`/users/${item.key}/`, row);
          newData.splice(index, 1, {
            ...item,
            ...row,
          });
          setData(newData);
          setEditingKey('');
          openNotification('Data is saved successfully');
        } catch (err) {
          openNotification('Unexpected error', true);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const columns = [
    {
      title: 'username',
      dataIndex: 'username',
      width: '25%',
      editable: true,
      required: true,
    },
    {
      title: 'email',
      dataIndex: 'email',
      width: '25%',
      editable: true,
      required: true,
    },
    {
      title: 'phone_number',
      dataIndex: 'phone_number',
      width: '25%',
      editable: true,
      required: false,
    },
    {
      title: 'money',
      dataIndex: 'money',
      width: '10%',
      editable: true,
      required: true,
    },
    {
      title: 'actions',
      dataIndex: 'actions',
      render: (_: any, record: Item) => {
        const editable = isEditing(record);

        return editable ? (
          <span>
            <a onClick={() => save(record.key)} style={{ marginRight: 8 }}>Save</a>
            <Popconfirm title='Sure to cancel?' onConfirm={cancel}><a>Cancel</a></Popconfirm>
            </span>
        ) : (
          <Space direction='horizontal'>
            <Typography.Link disabled={editingKey !== '' || jwt.decoded.refresh.user_id === record.id}
                             onClick={() => edit(record)}>
              Edit
            </Typography.Link>
            {jwt.decoded.refresh.user_id === record.id ? (
              <Typography.Link disabled>Delete</Typography.Link>
            ) : (
              <Popconfirm
                title='Sure to delete?'
                onConfirm={() => deleteItem(record.key)}
                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
              ><a>Delete</a></Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  const mergedColumns = columns.map(col => {
      if (!col.editable) {
        return col;
      }

      return {
        ...col,
        onCell: (item: Item) => ({
          item,
          inputType: col.dataIndex === 'money' ? 'number' : 'text',
          dataIndex: col.dataIndex,
          title: col.title,
          editing: isEditing(item),
        }),
      };
    },
  );

  return (
    <Layout>
      <Space direction='vertical' style={{ width: '100%' }}>
        <Button type='primary' onClick={() => setVisible(true)}>
          New user
        </Button>
        <UserCreateForm visible={visible} onCreate={onCreate} onCancel={() => setVisible(false)} />
        <Form form={form} component={false}>
          <Table
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            bordered
            expandable={{ expandedRowRender, onExpand }}
            dataSource={data}
            columns={mergedColumns}
            rowClassName='editable-row'
            pagination={{
              onChange: cancel,
            }}
          />
        </Form>
      </Space>
    </Layout>
  );
}
