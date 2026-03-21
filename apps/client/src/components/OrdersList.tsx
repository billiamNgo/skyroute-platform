type Order = { 
    id: string;
    customerName: string;
    address: string;
    distance: string;
    status: string;
};

type Props = { 
    orders: Order[];
};

export default function OrdersList({ orders }: Props) {
    if (orders.length === 0) { 
        return <p className="orders-message">No orders found.</p>;
    }

    return ( 
        <table className="orders-table">
            <thead> 
                <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Address</th>
                    <th>Distance</th>
                    <th>Status</th>
                </tr>
            </thead>
            
            <tbody> 
                {orders.map((order) => ( 
                    <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.customerName}</td>
                        <td>{order.address}</td>
                        <td>{order.distance}</td>
                        <td>{order.status}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}