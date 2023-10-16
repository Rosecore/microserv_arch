import Link from 'next/link';


const LandingPage = ({ currentUser, tickets }) => {
  const ticketList = tickets.map((ticket) => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
            <a>Просмотреть</a>
          </Link>
        </td>
      </tr>
    );
  });

  return (
    <div>
      <h1>Все билеты</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Место отправления</th>
            <th>Цена</th>
            <th>Просмотреть подробности</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  );
};

LandingPage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/api/tickets');

  return { tickets: data };
};

export default LandingPage;
