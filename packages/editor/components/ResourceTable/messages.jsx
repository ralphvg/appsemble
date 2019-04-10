import { defineMessages } from 'react-intl';

export default defineMessages({
  cancelButton: 'Cancel',
  createButton: 'Create',
  deleteButton: 'Delete',
  editButton: 'Update',
  createError: 'Something went wrong when creating a new resource.',
  deleteError: 'Something went wrong when deleting this resource.',
  updateError: 'Something went wrong when updating this resource.',
  loadError: 'Something went wrong when loading this resource.',
  createSuccess: 'Successfully created resource {id}.',
  deleteSuccess: 'Successfully deleted resource {id}.',
  updateSuccess: 'Successfully updated resource.',
  notManaged: 'This resource is not managed by Appsemble. You can find this resource at {link}',
  resourceWarningTitle: 'Deletion Warning',
  resourceWarning:
    'Are you sure you want to delete this resource? Deleted resources can not be recovered.',
});