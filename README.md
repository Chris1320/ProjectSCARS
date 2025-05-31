<div align="center">
    <a href="https://github.com/Chris1320/ProjectSCARS">
        <img src="https://raw.githubusercontent.com/Chris1320/ProjectSCARS/537fb4b6f6545be0758f956e4bd7ab447ff1fccc/WebClient/src/components/BENTOLogo.svg" alt="Bento Logo" width="15%" height="auto" />
    </a>
    <h1>
        Bento
        <a href="https://github.com/Chris1320/ProjectSCARS/tags">
            <img src="https://img.shields.io/github/v/tag/Chris1320/ProjectSCARS?sort=semver&filter=v*&style=flat&label=&color=0a0a0a" alt="Latest Version" />
        </a>
    </h1>
    <a href="https://github.com/Chris1320/ProjectSCARS/commits"><img src="https://img.shields.io/github/last-commit/Chris1320/ProjectSCARS?label=Last%20Commit&style=flat" alt="GitHub Last Commit" /></a>
    <a href="https://github.com/Chris1320/ProjectSCARS/issues"><img src="https://img.shields.io/github/issues/Chris1320/ProjectSCARS?label=Issues&style=flat" alt="GitHub Issues or Pull Requests" /></a>
    <a href="https://github.com/Chris1320/ProjectSCARS/actions/workflows/lint.yml"><img src="https://img.shields.io/github/actions/workflow/status/Chris1320/ProjectSCARS/lint.yml?flat&label=Codebase%20Style" alt="Linter Results" /></a>
    <a href="https://codecov.io/gh/Chris1320/ProjectSCARS"><img src="https://img.shields.io/codecov/c/github/Chris1320/ProjectSCARS?token=BJWS49M1DI&style=flat&label=Code%20Coverage" alt="Code Coverage" /></a>
    <a href="https://github.com/Chris1320/ProjectSCARS"><img src="https://img.shields.io/github/languages/code-size/Chris1320/ProjectSCARS?label=Repo%20Size&style=flat" alt="GitHub Repository Size" /></a>
    <a href="https://github.com/Chris1320/ProjectSCARS/milestone/2"><img src="https://img.shields.io/github/milestones/progress-percent/Chris1320/ProjectSCARS/2?style=flat&label=Completed&color=orange" alt="Project Milestone Progress" /></a>
</div>

**Bento** is a School Canteen Automated Reporting System for the Department
of Education (DepEd) Schools Division Office (SDO) of the City of Baliwag in
the Philippines.

> *Why Bento?*
>
> > "A bento is a Japanese-style single-portion take-out or home-packed meal,
> > often for lunch, typically including rice and packaged in a box with a lid.
> > The term bento is derived from the Chinese term biandang, which means
> > "convenient" or "convenience"."
> >
> > \- [Wikipedia](https://en.wikipedia.org/wiki/Bento)
>
> BENTO also stands for **B**aliuag's **E**nhanced **N**etwork for School Canteen **T**racking **O**perations.

| Component      | Open Issues                                                                                                                                                                                                                                                                                                            | Last Commit                                                                                                                                                                                                                  | Test Results                                                                                                                                                                                                                             | Code Coverage                                                                                                                                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Central Server | [![GitHub Issues or Pull Requests by label](https://img.shields.io/github/issues-raw/Chris1320/ProjectSCARS/scope%20%3E%20central%20server?style=for-the-badge&label=&color=%2300000000)](https://github.com/Chris1320/ProjectSCARS/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22scope%20%3E%20central%20server%22) | [![GitHub last commit](https://img.shields.io/github/last-commit/Chris1320/ProjectSCARS?path=CentralServer&style=for-the-badge&label=&color=%2300000000)](https://github.com/Chris1320/ProjectSCARS/tree/main/CentralServer) | [![Central Server Tests](https://img.shields.io/github/actions/workflow/status/Chris1320/ProjectSCARS/central-server-tests.yml?style=flat&label=)](https://github.com/Chris1320/ProjectSCARS/actions/workflows/central-server-tests.yml) | [![Central Server Code Coverage](https://img.shields.io/codecov/c/github/Chris1320/ProjectSCARS?token=BJWS49M1DI&flag=central-server&label=&style=flat)](https://app.codecov.io/gh/Chris1320/ProjectSCARS/flags) |
| Web Client     | [![GitHub Issues or Pull Requests by label](https://img.shields.io/github/issues-raw/Chris1320/ProjectSCARS/scope%20%3E%20web%20client?style=for-the-badge&label=&color=%2300000000)](https://github.com/Chris1320/ProjectSCARS/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22scope%20%3E%20web%20client%22)         | [![GitHub last commit](https://img.shields.io/github/last-commit/Chris1320/ProjectSCARS?path=WebClient&style=for-the-badge&label=&color=%2300000000)](https://github.com/Chris1320/ProjectSCARS/tree/main/WebClient)         | [![Web Client Tests](https://img.shields.io/github/actions/workflow/status/Chris1320/ProjectSCARS/web-client-tests.yml?style=flat&label=)](https://github.com/Chris1320/ProjectSCARS/actions/workflows/web-client-tests.yml)             | [![Web Client Code Coverage](https://img.shields.io/codecov/c/github/Chris1320/ProjectSCARS?token=BJWS49M1DI&flag=web-client&label=&style=flat)](https://app.codecov.io/gh/Chris1320/ProjectSCARS/flags)         |

<details>
    <summary>Code Coverage Graph</summary>
    <a href="https://codecov.io/gh/Chris1320/ProjectSCARS">
        <img src="https://codecov.io/gh/Chris1320/ProjectSCARS/graphs/sunburst.svg?token=BJWS49M1DI" alt="Code Coverage Graph" />
    </a>
    <p>
        The inner-most circle is the entire project, moving away from the center
        are folders then, finally, a single file. The size and color of each
        slice is representing the number of statements and the coverage,
        respectively.
    </p>
</details>

## Development

### Stacks

| Component      | Stack                                                                                                     |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| Central Server | [![Central Server Stack](https://skillicons.dev/icons?i=py,fastapi,sqlite,mysql,docker)](#central-server) |
| Web Client     | [![Web Client Stack](https://skillicons.dev/icons?i=ts,react,tailwind,nextjs)](#web-client)               |

#### Central Server

The central server is written in Python using the FastAPI framework and
utilizes SQLite or MySQL as its database, depending on the selected
configuration. It also uses either a pure-Python file object storage
or a third-party S3-compatible object storage for storing user avatars
and exported PDFs. It is responsible for handling the backend logic and
storing the submitted data of canteen managers.

##### Central Server Requirements

The hard requirements are as follows:

- [Python](https://python.org/) 3.13.x
- [uv](https://docs.astral.sh/uv/) >= 0.7.6

##### Central Server Development Setup

1. Install the [required software](#central-server-requirements).
2. Clone the repository.

   ```bash
   git clone https://github.com/Chris1320/ProjectSCARS.git
   ```

3. Navigate to the `CentralServer` directory.

   ```bash
   cd ProjectSCARS/CentralServer
   ```

4. Install dependencies.

   ```bash
   uv sync
   ```

5. Copy and edit the configuration file.

   ```bash
   cp .config.example.json config.json
   uv run ./scripts/secret.py sign     # Generate secure secret keys
   uv run ./scripts/secret.py encrypt  # and write it to `config.json`
   uv run ./scripts/secret.py refresh
   ```

   Edit the `config.json` file to their appropriate values.

6. Select the database you want to use. See [Database Setup](#central-server-database-setup) for more
   information.

7. Select the object store you want to use. See [Object Store Setup](#central-server-object-store-setup)
   for more information.

8. Run the FastAPI development server.

   ```bash
   uv run fastapi dev centralserver --host 0.0.0.0 --port 8081
   ```

> [!IMPORTANT]
> The default credentials are:
>
> - username: `bento`
> - password: `ProjectSCARS1`

###### Central Server Database Setup

The central server supports the following databases:

- SQLite (default)
- MySQL
- PostgreSQL

**Central Server SQLite Database**

To start using SQLite, just edit `./CentralServer/config.json` and adjust the
`database` property to use SQLite. The `connect_args` property is optional
and can be used to pass additional SQLAlchemy connection arguments.

```jsonc
{
  /* ... */
  "database": {
    "type": "sqlite",
    "config": {
      "filepath": "database.db",
      "connect_args": {
        // SQLAlchemy connection arguments
      },
    },
  },
  /* ... */
}
```

On startup, the central server will create a SQLite database file
in the file path specified in the `filepath` property. The default
is `centralserver.db` in the root directory of the central server.

This database is sufficient for development and testing purposes, but
for production use, it is recommended to use MySQL or similar
database server.

**Central Server MySQL Database**

Since SQLite is a file-based database and lacks the ability to run
multiple instances, it is not suitable for production use which needs
high throughput and availability. Therefore, the central server also
supports MySQL as a database. The MySQL database can be run in a
containerized environment using Docker or Podman.

1. Create a `.env` file in `./CentralServer/system/mysql/` using
   the example file.

   ```bash
   cd ./system/mysql/
   cp .env.example .env
   ```

2. Adjust the environment variables in
   `./CentralServer/system/mysql/.env`. For more information
   about MySQL Docker environment variables, see [their documentation](https://hub.docker.com/_/mysql).

3. Run the MySQL container.

   ```bash
   docker-compose up -d # Run this if you are using Docker.
   podman-compose up -d # Run this if you are using Podman.
   cd ../..
   ```

4. If successful, you should be able to access PHPMyAdmin at
   `http://localhost:8083`.

> [!IMPORTANT]
> You might need to log in as the root user in the database
> in the future. The root password is randomly generated,
> which can be seen in the logs of the MySQL container with
> the following format:
>
> `[Note] [Entrypoint]: GENERATED ROOT PASSWORD: bfPy...lqLL`

5. Update `./CentralServer/config.json` to use MySQL. Use the
   same database credentials as the ones in the
   `.env` file. The `connect_args` property is optional and
   can be used to pass additional SQLAlchemy connection
   arguments.

   ```jsonc
   {
     /* ... */
     "database": {
       "type": "mysql",
       "config": {
         "username": "ProjectSCARS_DatabaseAdmin",
         "password": "ProjectSCARS_mysql143",
         "host": "localhost",
         "port": 3306,
         "database": "ProjectSCARS_CentralServer",
         "connect_args": {
           // sqlalchemy connection arguments
         },
       },
     },
     /* ... */
   }
   ```

**Central Server PostgreSQL Database**

Another option is to use PostgreSQL as a database. Like the MySQL adapter,
you can run PostgreSQL with minimal configuration by following these steps:

1. Create a `.env` file in `./CentralServer/system/postgresql/` using
   the example file.

   ```bash
   cd ./system/postgresql/
   cp .env.example .env
   ```

2. Adjust the environment variables in
   `./CentralServer/system/postgresql/.env`. For more information
   about PostgreSQL Docker environment variables, see [their documentation](https://hub.docker.com/_/postgres).

3. Run the PostgreSQL container.

   ```bash
   docker-compose up -d # Run this if you are using Docker.
   podman-compose up -d # Run this if you are using Podman.
   cd ../..
   ```

4. If successful, you should be able to access Adminer at
   `http://localhost:8083`.

5. Update `./CentralServer/config.json` to use PostgreSQL. Use
   the same database credentials as the ones in the `.env`
   file. The `connect_args` property is optional and can
   be used to pass additional SQLAlchemy connection
   arguments.

   ```jsonc
   {
     /* ... */
     "database": {
       "type": "postgres",
       "config": {
         "username": "ProjectSCARS_DatabaseAdmin",
         "password": "ProjectSCARS_postgres143",
         "host": "localhost",
         "port": 5432,
         "database": "ProjectSCARS_CentralServer",
         "connect_args": {
           // sqlalchemy connection arguments
         },
       },
     },
     /* ... */
   }
   ```

###### Central Server Object Store Setup

The central server supports the following object stores:

- Local file object store (default)
- MinIO S3-compatible object store

**Local File Object Store**

To start using the local file object store, just edit
`./CentralServer/config.json` and adjust the `object_store` property to match the following structure:

```jsonc
{
  /* ... */
  "object_store": {
    "type": "local",
    "config": {
      "filepath": "./data/",
    },
  },
  /* ... */
}
```

When the central server starts, it will use the provided
filepath to store the files (objects). Make sure that the
filepath is writable by the server. The default is `./data/`
in the root directory of the central server. It is already
created in the repository, so no further action is needed.

Because the local file object store is implemented in the
central server itself, it does not provide any integrity
and redundancy systems. Therefore, it is recommended to
use a dedicated object store for production use, and
use the local file object store only for development
purposes.

**MinIO S3-Compatible Object Store**

Using MinIO, it is possible to provide multiple nodes
to store the objects. This is useful for redundancy and
high availability, therefore it is recommended to be used
in production. The MinIO object store can be run in a
containerized environment using Docker or Podman.

1. Create a `.env` file in `./CentralServer/system/minio/` using
   the example file.

   ```bash
   cd ./system/minio/
   cp .env.example .env
   ```

2. Adjust the environment variables in
   `./CentralServer/system/minio/.env`.

3. Run the MinIO container.

   ```bash
   docker-compose up -d # Run this if you are using Docker.
   podman-compose up -d # Run this if you are using Podman.
   cd ../..
   ```

4. If successful, you should be able to access the MinIO dashboard at
   `http://localhost:8084`.

5. Log in to the dashboard using the credentials in the `.env` file.

6. Navigate to the `Access Keys` tab and create a new access key. Make
   sure to copy the keys, as they will not be shown again.

7. Edit `./CentralServer/config.json` and adjust the `object_store`
   to match the following structure:

   ```jsonc
   {
     /* ... */
     "object_store": {
       "type": "minio",
       "config": {
         "endpoint": "localhost:9000",
         "access_key": "YOUR_ACCESS_KEY",
         "secret_key": "YOUR_SECRET_KEY",
         "secure": false,
       },
     },
     /* ... */
   }
   ```

**Garage S3-Compatible Object Store**

Garage is another free and open-source S3-compatible object store
that can be used with the central server. It is similar to MinIO,
but it is designed to be lightweight and easy to use. To use Garage,
you can follow the steps below:

1. Create a `.env` file in `./CentralServer/system/garage/` using
   the example file.

   ```bash
   cd ./system/garage/
   cp .env.example .env
   ```

2. Adjust the environment variables in
   `./CentralServer/system/garage/.env`.

3. Run the Garage container.

   ```bash
   docker-compose up -d # Run this if you are using Docker.
   podman-compose up -d # Run this if you are using Podman.
   cd ../..
   ```

4. If successful, you should be able to access the s3manager dashboard at
   `http://localhost:8084`.

5. Edit `./CentralServer/config.json` and adjust the `object_store`
   to match the following structure:

   ```jsonc
   {
     /* ... */
     "object_store": {
       "type": "garage",
       "config": {
         "endpoint": "localhost:9000",
         "access_key": "YOUR_ACCESS_KEY",
         "secret_key": "YOUR_SECRET_KEY",
         "secure": false,
       },
     },
     /* ... */
   }
   ```


###### Central Server Environment Variables

The following environment variables are used by the central server
to further configure its behavior. These variables are optional.

| Environment Variable             | Value           | Description                                |
| -------------------------------- | --------------- | ------------------------------------------ |
| `CENTRAL_SERVER_CONFIG_FILE`     | `./config.json` | The path of the configuration file to use. |
| `CENTRAL_SERVER_CONFIG_ENCODING` | `utf-8`         | The encoding of the configuration file.    |

> [!TIP]
> If you want to use a different configuration file, you can run the following:
>
> For *Linux* users:
>
> ```bash
> CENTRAL_SERVER_CONFIG_FILE=.config.dev.json uv run fastapi dev centralserver --host 0.0.0.0 --port 8081
> ```
>
> For *Windows* users:
>
> ```powershell
> $env:CENTRAL_SERVER_CONFIG_FILE=".config.dev.json"; uv run fastapi dev centralserver --host 0.0.0.0 --port 8081
> ```

###### Central Server SMTP Connection

To enable email notifications, password resets, and other email-related
functionality, you have to connect the central server to an SMTP server.

**Gmail SMTP Connection**

The most basic approach is to use Gmail as the SMTP server. Just follow
the instructions in the link below to create an *app password*:

[https://support.google.com/accounts/answer/185833](https://support.google.com/accounts/answer/185833?hl=en)

This is a 16-character-long string, grouped by 4 characters and separated by spaces.
Remove the spaces and you will get your app password.
After you have successfully created an app password, update your
configuration file:

```jsonc
{
    /* ... */
   "mailing": {
        "enabled": true,
        "server": "smtp.gmail.com",
        "port": 587,
        "from_address": "your_username@gmail.com",
        "username": "your_username@gmail.com",
        "password": "your-app-password"
    }
    /* ... */
}
```

###### Resetting Central Server Data

While contributing to the project, you might have to start your database and object store from scratch.
Because of this, you can run `scripts/clean.py` to reset them.

```bash
# Clean the database and object store configured in config.json:
uv run ./scripts/clean.py

# Clean the database and object store configured in another config file:
uv run ./scripts/clean.py --config CONFIG_FILEPATH
```

#### Web Client

The web client is written in TypeScript using the Next.js framework. It
is the user-facing application that allows canteen managers to submit
their monthly financial reports to the central server.

##### Web Client Requirements

The web client is written in TypeScript v5,
and is run via [NodeJS](https://nodejs.org) v23.6.0.

##### Web Client Development Setup

1. Install the required software.
2. Clone the repository.

   ```bash
   git clone https://github.com/Chris1320/ProjectSCARS.git
   ```

3. Navigate to the `WebClient` directory.

   ```bash
   cd ProjectSCARS/WebClient
   ```

4. Install dependencies.

   ```bash
   npm install
   ```

5. Run the development server.

   ```bash
   npm run dev
   ```

> [!IMPORTANT]
> Look at the *central server* documentation for the default
> credentials.

---

## Authors

<div align="center">
    <table>
        <tbody>
            <tr>
                <td><a href="https://github.com/Kirito090504"><img src="https://github.com/Kirito090504.png" alt="Kirito090504 user profile" width="100px" height="auto" /></a></td>
                <td><a href="https://github.com/Staber07"><img src="https://github.com/Staber07.png" alt="Staber07 user profile" width="100px" height="auto" /></a></td>
                <td><a href="https://github.com/rruonan"><img src="https://github.com/rruonan.png" alt="rruonan user profile" width="100px" height="auto" /></a></td>
                <td><a href="https://github.com/Chris1320"><img src="https://github.com/Chris1320.png" alt="Chris1320 user profile" width="100px" height="auto" /></a></td>
            </tr>
            <tr>
                <td><p><b><a href="https://github.com/Kirito090504">Kirito090504</a></b></p></td>
                <td><p><b><a href="https://github.com/Staber07">Staber07</a></b></p></td>
                <td><p><b><a href="https://github.com/rruonan">rruonan</a></b></p></td>
                <td><p><b><a href="https://github.com/Chris1320">Chris1320</a></b></p></td>
            </tr>
            <tr>
                <td><p>BS Computer Science</p></td>
                <td><p>BS Information Technology</p></td>
                <td><p>BS Computer Science</p></td>
                <td><p>BS Computer Science</p></td>
            </tr>
        </tbody>
    </table>
</div>
