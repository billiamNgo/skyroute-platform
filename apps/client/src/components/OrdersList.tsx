type Order = { 
    id: string;
    customerName: string;
    address: string;
    distance: string;
    status: string;
    packageWeight: string;
    medication: string,
    eta: string;
};

type Props = { 
    orders: Order[];
    onSelect: (order: Order) => void;
    selectedOrderId?: string;
};

export default function OrdersList({ 
    orders,
    onSelect,
    selectedOrderId, 
}: Props) {
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
                    <tr 
                        key={order.id}
                        onClick={() => onSelect(order)}
                        className={selectedOrderId === order.id ? "selected-order-row" : ""}
                    >
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