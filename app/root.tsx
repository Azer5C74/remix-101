import {
  json,
  redirect,
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import {
  Form,
  Link,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
  LiveReload,
} from "@remix-run/react";
import { ChangeEvent, useEffect, useState, FormEvent } from "react";

import { createEmptyContact, getContacts } from "./data";
import appStylesHref from "./app.css?url";

// Action to handle form submission for creating a new contact
export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
};

// Loader function to fetch contacts based on the query parameter
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return json({ contacts, q });
};

// Links function to include the stylesheet
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

export default function App() {
  const navigation = useNavigation();
  const { contacts, q } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const [query, setQuery] = useState(q || "");

  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  useEffect(() => {
    setQuery(q || "");
  }, [q]);

  const handleSearchChange = (event: FormEvent<HTMLFormElement>) => {
    const isFirstSearch = q === null;
    submit(event.currentTarget, {
      replace: !isFirstSearch,
    });
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) =>
    setQuery(event.currentTarget.value);

  const renderContacts = () => {
    if (contacts.length) {
      return (
        <ul>
          {contacts.map((contact) => (
            <li key={contact.id}>
              <NavLink
                className={({ isActive, isPending }) =>
                  isActive ? "active" : isPending ? "pending" : ""
                }
                to={`contacts/${contact.id}`}
              >
                <Link to={`contacts/${contact.id}`}>
                  {contact.first || contact.last ? (
                    <>
                      {contact.first} {contact.last}
                    </>
                  ) : (
                    <i>No Name</i>
                  )}{" "}
                  {contact.favorite ? <span>★</span> : null}
                </Link>
              </NavLink>
            </li>
          ))}
        </ul>
      );
    } else {
      return (
        <p>
          <i>No contacts</i>
        </p>
      );
    }
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            <Form id="search-form" onChange={handleSearchChange} role="search">
              <input
                id="q"
                aria-label="Search contacts"
                className={searching ? "loading" : ""}
                onChange={handleInputChange}
                placeholder="Search"
                type="search"
                value={query}
                name="q"
              />
              <div id="search-spinner" aria-hidden hidden={!searching} />
            </Form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>{renderContacts()}</nav>
        </div>

        <div
          id="detail"
          className={
            navigation.state === "loading" && !searching ? "loading" : ""
          }
        >
          <Outlet />
          {process.env.NODE_ENV === "development" ? <LiveReload /> : null}
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
