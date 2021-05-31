interface PageResponse<Result> {
  count: number,
  next: string,
  previous?: string,
  results: Result[]
}

interface IdInterface {
  id: number
}

interface IBrand extends IdInterface {
  name: string
}

interface IVehicle extends IdInterface{
  brand: string,
  model: string,
  type: 'economy' | 'estate' | 'luxury' | 'suv' | 'cargo',
  fuel_type: 'petrol' | 'diesel' | 'hybrid' | 'electric',
  seats: number
}

interface IVehicleRent extends IdInterface {
  picture: string,
  price: number,
  count: number,
  vehicle: IVehicle
}

interface IUser extends IdInterface {
  username: string,
  first_name: string,
  last_name: string,
  email: string,
  phone_number?: string,
  money: number
}

interface IRentalEvent extends IdInterface {
  start_date: string,
  end_date: string,
  user: number,
  vehicle_rent: number
}
