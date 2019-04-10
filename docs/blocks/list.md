# Detail Viewer

## Introduction

A block that can be used to display larger sets of data.

## Actions

| Action | Required | Description                                                           |
| ------ | -------- | --------------------------------------------------------------------- |
| load   | true     | Action that is called when loading in data, must return a set of data |
| click  | false    | Action that is called when clicking on a row.                         |

## Parameters

| Parameter      | Default       | Description                                                                |
| -------------- | ------------- | -------------------------------------------------------------------------- |
| fields         |               | A list of fields to display based on the name from the schema              |
| fields[].name  |               | The name of the property of the data to fetch from. Supports dot notation. |
| fields[].label | fields[].name | The label that is presented to the user                                    |

## Images

<a href="../images/form.png"  target="_blank"><img src="../images/form.png" style="width: 300px" /></a>