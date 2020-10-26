import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { Fragment } from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import cx from 'classnames';

import styles from './styles/Layout.module.scss';

const ITEMS = [
  { path: 'rounds', label: 'Rounds' },
  { path: 'stats', label: 'Stats' },
];

const DEFAULT_ITEM = 'rounds';

const Emoji = () => (
  <span aria-label="weekday-golf" role="img">🏌🏾‍♂</span>
);

const Layout = ({ children, rounds, stats, title }) => {
  const { pathname } = useRouter();
  const activeKey = pathname.replace('/', '') || DEFAULT_ITEM;

  return (
    <Fragment>
      <Head>
        <title>Weekday Golf · {title}</title>
        <link
          href="/apple-touch-icon.png"
          rel="apple-touch-icon"
          sizes="180x180"
        />
        <link
          href="/favicon-32x32.png"
          rel="icon"
          sizes="32x32"
          type="image/png"
        />
        <link
          href="/favicon-16x16.png"
          rel="icon"
          sizes="16x16"
          type="image/png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossOrigin="anonymous" />
      </Head>
      <Navbar
        className={cx(styles.appNav, 'justify-content-between')}
        sticky="top">
        <Container>
          <Link href="/" passHref>
            <Navbar.Brand>
              <Emoji /> Weekday Golf
            </Navbar.Brand>
          </Link>
          <Nav activeKey={activeKey}>
            {ITEMS.map(({ label, path }) => (
              <Link href={`/${path}`} key={path} passHref>
                <Nav.Link eventKey={path}>
                  {label}
                </Nav.Link>
              </Link>
            ))}
          </Nav>
        </Container>
      </Navbar>
      <Container>
        {children}
      </Container>
    </Fragment>
  );
};

export default Layout;
