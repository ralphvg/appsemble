# Deployment Using Docker Compose

Appsemble is published as a Docker image. This makes it easy to deploy using Docker Compose. Copy
the following contents in a file named _.docker-compose.yaml_.

```yaml
version: '3.3'

services:
  appsemble:
    image: appsemble/appsemble:latest
    depends_on:
      - mysql
    restart: always
    environment:
      DATABASE_NAME: appsemble_database_name
      DATABASE_USER: appsemble_database_user
      DATABASE_PASSWORD: appsemble_database_password
    ports:
      # Expose Appsemble at port 8000.
      - '8000:9999'

  mysql:
    image: mysql:8
    command: --default-authentication-plugin=mysql_native_password
    restart: always
    environment:
      MYSQL_DATABASE: appsemble_database_name
      MYSQL_USER: appsemble_database_user
      MYSQL_PASSWORD: appsemble_database_password
      MYSQL_RANDOM_ROOT_PASSWORD: 'yes'
```

It is highly recommended to specify the version of the `appsemble/appsemble` image to use. Replace
`latest` with a specific version. All available versions can be found on [Appsemble tags page][] on
Docker Hub.

It is also recommended to modify the database name, user, and password.

To start the service, run the following command.

```
$ docker-compose up -d
```

The Appsemble editor should now be available on http://localhost:8000/editor.

To stop the service, run the following command.

```
$ docker-compose down
```

Once Appsemble is up and running, you probably to upload blocks. For this, clone the Appsemble git
repository and continue to the [Blocks in the readme](../#Blocks).

[appsemble tags page]: https://hub.docker.com/r/appsemble/appsemble/tags