# Feed

## Introduction

A block that displays a feed of cards.

This can be used for example to show a social media feed in an app.

## Actions

| Action      | Required | Description                                                  |
| ----------- | -------- | ------------------------------------------------------------ |
| load        |          | Action that gets dispatched when data is initially loaded.   |
| loadReply   | true     | Action to retrieve replies, dispatched on every feed item.   |
| submitReply |          | Action that gets dispatched when submitting a reply.         |
| avatarClck  |          | Action that gets dispatched when a user clicks on an avatar. |

## Parameters

| Parameter      | Default  | Description                                                                                    |
| -------------- | -------- | ---------------------------------------------------------------------------------------------- |
| title          |          | The field that will be used as the title of a card.                                            |
| subtitle       |          | The field that will be used as the sub title of a card.                                        |
| heading        |          | The field that will be used as a heading of a card.                                            |
| picture        |          | The field that will be used to display a picture.                                              |
| description    |          | The field that will be used as the content description of the card.                            |
| reply.content  | content  | The field that will be used to read the content of a reply.                                    |
| reply.author   | author   | The field that will be used to display the author of a reply                                   |
| reply.parentId | parentId | The field that will be used to associate with the parent resource when submitting a new reply. |