import { IconName } from '@fortawesome/fontawesome-common-types';
import { OpenAPIV3 } from 'openapi-types';

/**
 * OpenID Connect specifies a set of standard claims about the end-user, which cover common profile
 * information such as name, contact details, date of birth and locale.
 *
 * The Connect2id server can be set up to provide additional custom claims, such as roles and
 * permissions.
 */
export interface UserInfo {
  /**
   * The subject (end-user) identifier. This member is always present in a claims set.
   */
  sub: number;

  /**
   * The full name of the end-user, with optional language tag.
   */
  name: string;

  /**
   * The end-user's preferred email address.
   */
  email: string;

  /**
   * True if the end-user's email address has been verified, else false.
   */
  // eslint-disable-next-line camelcase
  email_verified: boolean;

  /**
   * The URL of the profile picture for the end-user.
   */
  picture: string;
}

export interface Security {
  login?: 'password';
  default: {
    role: string;
    policy?: 'everyone' | 'organization' | 'invite';
  };
  roles: {
    [role: string]: {
      description?: string;
      inherits?: string[];
    };
  };
}

/*
 * HTTP methods that support a request body.
 */
export type BodyHTTPMethodsUpper = 'PATCH' | 'POST' | 'PUT';

/**
 * HTTP methods that support a request body, but lower case.
 */
export type BodyHTTPMethodsLower = 'patch' | 'post' | 'put';

/**
 * HTTP methods that support a request body, but all upper case or all lower case..
 */
export type BodyHTTPMethods = BodyHTTPMethodsUpper | BodyHTTPMethodsLower;

/**
 * Common HTTP methods.
 */
export type HTTPMethodsUpper = 'DELETE' | 'GET' | BodyHTTPMethodsUpper;

/**
 * Common HTTP methods, but lower case.
 */
export type HTTPMethodsLower = 'delete' | 'get' | BodyHTTPMethodsLower;

/**
 * Common HTTP methods, but either all upper case or all lower case.
 */
export type HTTPMethods = HTTPMethodsUpper | HTTPMethodsLower;

/**
 * A color know to Bulma.
 */
export type BulmaColor =
  | 'dark'
  | 'primary'
  | 'link'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'white';

export interface Theme {
  /**
   * The color primarily featured in the color scheme.
   */
  primaryColor: string;

  /**
   * The color used for links.
   */
  linkColor: string;

  /**
   * The color used to feature succesful or positive actions.
   */
  successColor: string;

  /**
   * The color used to indicate information.
   */
  infoColor: string;

  /**
   * The color used for elements that require extra attention.
   */
  warningColor: string;

  /**
   * The color used for elements that demand caution for destructive actions.
   */
  dangerColor: string;

  /**
   * The color used in the foreground of the splash screen.
   */
  themeColor: string;

  /**
   * The color used in the background of the splash screen.
   */
  splashColor: string;

  /**
   * The link to the tile layer used for Leaflet maps.
   */
  tileLayer: string;
}

export interface Message {
  /**
   * The content of the message to display.
   */
  body: string;

  /**
   * The color to use for the message.
   */
  color?: BulmaColor;

  /**
   * The timeout period for this message (in milliseconds).
   */
  timeout?: number;

  /**
   * Whether or not to show the dismiss button.
   */
  dismissable?: boolean;
}

export type Navigation = 'bottom' | 'left-menu' | 'hidden';

export interface EventParams {
  emit?: string;
  listen?: string;
}

/**
 * A block that is displayed on a page.
 */
export interface Block<P = any, A = {}, E extends EventParams = Required<EventParams>> {
  /**
   * The type of the block.
   *
   * A block type follow the format `@organization/name`.
   * If the organization is _appsemble_, it may be omitted.
   *
   * Pattern:
   * ^(@[a-z]([a-z\d-]{0,30}[a-z\d])?\/)?[a-z]([a-z\d-]{0,30}[a-z\d])$
   *
   * Examples:
   * - `form`
   * - `@amsterdam/splash`
   */
  type: string;

  /**
   * A [semver](https://semver.org) representation of the block version.
   *
   * Pattern:
   * ^\d+\.\d+\.\d+$
   */
  version: string;

  /**
   * The theme of the block.
   */
  theme?: Theme;

  /**
   * A free form mapping of named paramters.
   *
   * The exact meaning of the parameters depends on the block type.
   */
  parameters?: P;

  /**
   * A mapping of actions that can be fired by the block to action handlers.
   *
   * The exact meaning of the parameters depends on the block type.
   */
  actions?: A;

  /**
   * Mapping of the events the block can listen to and emit.
   *
   * The exact meaning of the parameters depends on the block type.
   */
  events?: {
    listen: Record<E['listen'], string>;
    emit: Record<E['emit'], string>;
  };

  /**
   * A list of roles that are allowed to view this block.
   */
  roles?: string[];
}

/**
 * A collection of hooks that are triggered upon calling a resource actions.
 */
export interface ResourceHooks {
  notification: {
    to: string[];
    subscribe: 'all' | 'single' | 'both';
    data: {
      title: string;
      content: string;
      link: string;
    };
  };
}

export interface ResourceCall {
  /**
   * The HTTP method to use for making the HTTP request.
   */
  method: HTTPMethods;

  /**
   * The URL to which to make the resource request.
   */
  url: string;

  /**
   * The associated hooks with the resource action.
   */
  hooks: ResourceHooks;
}

export interface Resource {
  /**
   * The definition for the `resource.create` action.
   */
  create: ResourceCall;

  /**
   * The definition for the `resource.delete` action.
   */
  delete: ResourceCall;

  /**
   * The definition for the `resource.get` action.
   */
  get: ResourceCall;

  /**
   * The definition for the `resource.query` action.
   */
  query: ResourceCall;

  /**
   * The definition for the `resource.update` action.
   */
  update: ResourceCall;

  /**
   * How to upload blobs.
   */
  blobs?: BlobUploadType;

  /**
   * The property to use as the id.
   *
   * @default `id`
   */
  id?: number;

  /**
   * The JSON schema to validate resources against before sending it to the backend.
   */
  schema: OpenAPIV3.SchemaObject;

  /**
   * The URL to post the resource to.
   *
   * @default autogenerated for use with the Appsemble resource API.
   */
  url?: string;
}

export interface BaseAction<T extends string> {
  /**
   * The type of the action.
   */
  type: T;

  /**
   * A function which can be called to dispatch the action.
   */
  dispatch: (data?: any) => Promise<any>;
}

type RequestLikeActionTypes =
  | 'request'
  | 'resource.create'
  | 'resource.delete'
  | 'resource.get'
  | 'resource.query'
  | 'resource.update';

export interface LinkAction extends BaseAction<'link'> {
  /**
   * Get the link that the action would link to if the given data was passed.
   */
  href: (data?: any) => string;
}

export interface LogAction extends BaseAction<'log'> {
  /**
   * The logging level.
   */
  level: 'info' | 'warn' | 'error';
}

export interface RequestLikeAction<T extends RequestLikeActionTypes> extends BaseAction<T> {
  /**
   * The HTTP method used to make the request.
   */
  method: HTTPMethods;
  /**
   * The URL to which the request will be made.
   */
  url: string;
}

export type RequestAction = RequestLikeAction<'request'>;
export type ResourceCreateAction = RequestLikeAction<'resource.create'>;
export type ResourceDeleteAction = RequestLikeAction<'resource.delete'>;
export type ResourceGetAction = RequestLikeAction<'resource.get'>;
export type ResourceQueryAction = RequestLikeAction<'resource.query'>;
export type ResourceUpdateAction = RequestLikeAction<'resource.update'>;

/**
 * An action that can be called from within a block.
 */
export type Action =
  | BaseAction<'dialog'>
  | BaseAction<'dialog.error'>
  | BaseAction<'dialog.ok'>
  | BaseAction<'flow.back'>
  | BaseAction<'flow.cancel'>
  | BaseAction<'flow.finish'>
  | BaseAction<'flow.next'>
  | BaseAction<'noop'>
  | BaseAction<'event'>
  | LinkAction
  | LogAction
  | RequestAction
  | ResourceGetAction
  | ResourceQueryAction
  | ResourceCreateAction
  | ResourceUpdateAction
  | ResourceDeleteAction
  | BaseAction<'resource.subscribe'>;

export interface BlobUploadType {
  type?: 'upload';
  method?: BodyHTTPMethods;
  serialize?: 'custom';
  url?: string;
}

interface BaseActionDefinition<T extends Action['type']> {
  /**
   * The element to use as the base when returning the response data.
   */
  base: string;

  /**
   * The type of the action.
   */
  type: T;

  /**
   * A remapper function. This may be used to remap data before it is passed into the action
   * function.
   */
  remap: string;
}

interface DialogActionDefinition extends BaseActionDefinition<'dialog'> {
  /**
   * If false, the dialog cannot be closed by clicking outside of the dialog or on the close button.
   */
  closable?: boolean;

  /**
   * If true, the dialog will be displayed full screen.
   */
  fullscreen?: boolean;

  /**
   * Blocks to render on the dialog.
   */
  blocks: Block[];

  /**
   * The title to show in the dialog.
   */
  title?: string;
}

interface LinkActionDefinition extends BaseActionDefinition<'link'> {
  /**
   * Where to link to.
   *
   * This should be a page name.
   */
  to: string;

  /**
   * Parameters to use for formatting the link.
   */
  parameters?: Record<string, any>;
}

interface LogActionDefinition extends BaseActionDefinition<'log'> {
  /**
   * The logging level on which to log.
   *
   * @default `info`.
   */
  level: LogAction['level'];
}

interface RequestLikeActionDefinition<T extends RequestLikeActionTypes = RequestLikeActionTypes>
  extends BaseActionDefinition<T> {
  /**
   * The element to use as the base when returning the response data.
   */
  base: string;

  /**
   * Specify how to handle blobs in the object to upload.
   */
  blobs: BlobUploadType;

  /**
   * The HTTP method to use for making a request.
   */
  method: HTTPMethods;

  /**
   * A JSON schema against which to validate data before uploading.
   */
  schema: OpenAPIV3.SchemaObject;

  /**
   * Query parameters to pass along with the request.
   */
  query: Record<string, string>;

  /**
   * The URL to which to make the request.
   */
  url: string;

  /**
   * How to serialize the request body.
   */
  serialize: 'formdata';

  /**
   * An additional action to execute after the request has succeeded.
   */
  onSuccess?: ActionDefinition;
  /**
   * An additional action to execute after the request has resulted in an error.
   */
  onError?: ActionDefinition;
}

interface ResourceActionDefinition<T extends RequestLikeActionTypes>
  extends RequestLikeActionDefinition<T> {
  /**
   * The name of the resource.
   */
  resource: string;
}

type RequestActionDefinition = RequestLikeActionDefinition<'request'>;
type ResourceCreateActionDefinition = ResourceActionDefinition<'resource.create'>;
type ResourceDeleteActionDefinition = ResourceActionDefinition<'resource.delete'>;
type ResourceGetActionDefinition = ResourceActionDefinition<'resource.get'>;
type ResourceQueryActionDefinition = ResourceActionDefinition<'resource.query'>;
type ResourceUpdateActionDefinition = ResourceActionDefinition<'resource.update'>;

export interface ResourceSubscribeActionDefinition
  extends BaseActionDefinition<'resource.subscribe'> {
  /**
   * The name of the resource.
   */
  resource: string;

  /**
   * The action to subscribe to. Defaults to `update` if not specified.
   */
  action?: 'create' | 'update' | 'delete';
}

export interface EventActionDefinition extends BaseActionDefinition<'event'> {
  /**
   * The name of the event to emit to.
   */
  event: string;
}

export type ActionDefinition =
  | BaseActionDefinition<'flow.back'>
  | BaseActionDefinition<'flow.cancel'>
  | BaseActionDefinition<'flow.finish'>
  | BaseActionDefinition<'flow.next'>
  | BaseActionDefinition<'noop'>
  | DialogActionDefinition
  | LinkActionDefinition
  | LogActionDefinition
  | RequestActionDefinition
  | ResourceCreateActionDefinition
  | ResourceDeleteActionDefinition
  | ResourceGetActionDefinition
  | ResourceQueryActionDefinition
  | ResourceUpdateActionDefinition
  | ResourceSubscribeActionDefinition
  | EventActionDefinition

  // XXX This shouldn’t be here, but TypeScript won’t shut up without it.
  | RequestLikeActionDefinition;

export interface ActionType {
  /**
   * Whether or not app creators are required to define this action.
   */
  required?: boolean;
}

export interface BlockManifest {
  /**
   * A block manifest as it is available to the app and in the SDK.
   * pattern: ^@[a-z]([a-z\d-]{0,30}[a-z\d])?\/[a-z]([a-z\d-]{0,30}[a-z\d])$
   * The name of a block.
   */
  name: string;

  /**
   * A [semver](https://semver.org) representation of the block version.
   *
   * Pattern:
   * ^\d+\.\d+\.\d+$
   */
  version: string;

  /**
   * The type of layout to be used for the block.
   */
  layout: 'float' | 'static' | 'grow' | 'hidden' | null;

  /**
   * Array of urls associated to the files of the block.
   */
  files: string[];

  /**
   * The actions that are supported by a block.
   */
  actions?: Record<string, ActionType>;

  /**
   * The events that are supported by a block.
   */
  events?: {
    listen: string[];
    emit: string[];
  };
}

/**
 * This describes what a page will look like in the app.
 */
export interface BasePage {
  /**
   * The name of the page.
   *
   * This will be displayed on the top of the page and in the side menu.
   */
  name: string;

  /**
   * A list of roles that may view the page.
   */
  roles?: string[];

  /**
   * An optional icon from the fontawesome icon set
   *
   * This will be displayed in the navigation menu.
   */
  icon?: IconName;

  /**
   * Page parameters can be used for linking to a page that should display a single resource.
   */
  parameters?: string[];

  /**
   * A mapping of actions that can be fired by the page to action handlers.
   */
  actions?: Record<string, ActionDefinition>;

  /**
   * The global theme for the page.
   */
  theme?: Theme;

  /**
   * The navigation type to use.
   *
   * If this is omitted, a collapsable side navigation menu will be rendered on the left.
   */
  navigation?: Navigation;

  /**
   * Whether or not the page should be displayed in navigational menus.
   */
  hideFromMenu?: boolean;
}

interface SubPage {
  name: string;
  blocks: Block[];
}

interface BasicPage extends BasePage {
  type?: 'page';
  blocks: Block[];
}

interface FlowPage extends BasePage {
  type: 'flow';
  subPages: SubPage[];
}

interface TabsPage extends BasePage {
  type: 'tabs';
  subPages: SubPage[];
}

export type Page = BasicPage | FlowPage | TabsPage;

export interface AppDefinition {
  /**
   * The name of the app.
   *
   * This determines the default path of the app.
   */
  name?: string;

  /**
   * The description of the app.
   */
  description?: string;

  security?: Security;

  /**
   * A list of roles that are required to view pages. Specific page roles override this property.
   */
  roles?: string[];

  /**
   * The default page of the app.
   */
  defaultPage: string;

  /**
   * The navigation type to use.
   *
   * If this is omitted, a collapsable side navigation menu will be rendered on the left.
   */
  navigation?: Navigation;

  /**
   * The strategy to use for apps to subscribe to push notifications.
   *
   * If this is omitted, push notifications can not be sent.
   */
  notifications?: 'opt-in' | 'startup';

  /**
   * The pages of the app.
   */
  pages: Page[];

  /**
   * Resource definitions that may be used by the app.
   */
  resources?: Record<string, Resource>;

  /**
   * The global theme for the app.
   */
  theme?: Theme;
}

/**
 * The rating for an app.
 */
interface Rating {
  /**
   * The number of people who rated the app.
   */
  count: number;

  /**
   * THe average app rating.
   */
  average: number;
}

export interface App {
  /**
   * The unique identifier for the app.
   *
   * This value will be generated automatically by the API.
   */
  id?: number;

  /*
   * A domain name on which this app should be served.
   */
  domain?: string;

  /**
   * The id of the organization to which this app belongs.
   */
  OrganizationId?: string;

  path: string;
  private: boolean;

  definition: AppDefinition;

  /**
   * The app definition formatted as YAML.
   */
  yaml: string;

  /**
   * An app rating.
   */
  rating?: Rating;
}

/**
 * A rating given to an app.
 */
export interface Rating {
  /**
   * A value ranging between 1 and 5 representing the rating
   */
  rating: number;

  /**
   * An optional description of why the rating was given
   */
  description?: string;

  /**
   * The name of the user who rated the app.
   */
  name: string;

  /**
   * The ID of the user who rated the app.
   */
  UserId: number;

  /**
   * The creation date of the rating.
   */
  $created: string;

  /**
   * The date of the last time the rating was updated
   */
  $updated: string;
}

/**
 * The representation of an organization within Appsemble.
 */
export interface Organization {
  /**
   * The ID of the organization.
   *
   * This typically is prepended with an `@`
   */
  id: string;

  /**
   * The display name of the organization.
   */
  name: string;
}

/**
 * A member of an app.
 */
export interface AppMember {
  id: number;
  name: string;
  primaryEmail: string;
  role: string;
}
