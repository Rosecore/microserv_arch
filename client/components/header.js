import Link from 'next/link';

export default ({ currentUser }) => {
  const links = [
    !currentUser && { label: 'Регистрация', href: '/auth/signup' },
    !currentUser && { label: 'Вход', href: '/auth/signin' },
    currentUser && { label: 'Продать билет', href: '/tickets/new' },
    currentUser && { label: 'Корзина', href: '/orders' },
    currentUser && { label: 'Выход', href: '/auth/signout' },
  ]
    .filter((linkConfig) => linkConfig)
    .map(({ label, href }) => {
      return (
        <li key={href} className="nav-item">
          <Link href={href}>
            <a className="nav-link text-white font-weight-light">{label}</a>
          </Link>
        </li>
      );
    });

  return (
    <nav className="navbar navbar-light .bg-dark">
      <Link href="/">
        <a className="navbar-brand text-white font-weight-light">Сервис для продажи и покупки билетов на транспорт. Транькова М.С. А-07-17.</a>
      </Link>

      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">{links}</ul>
      </div>
    </nav>
  );
};
