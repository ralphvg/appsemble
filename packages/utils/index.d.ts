import { AppDefinition, Block, Security, Theme } from '@appsemble/types';
import { OpenAPIV3 } from 'openapi-types';

type MapperFunction = (data: any) => any;

interface Context {
  intl: {
    formatDate: (data: string) => string;
    formatTime: (data: string) => string;
  };
}

type Permission =
  | 'ViewApps'
  | 'ManageRoles'
  | 'ManageMembers'
  | 'PublishBlocks'
  | 'CreateApps'
  | 'EditApps'
  | 'EditAppSettings'
  | 'EditThemes'
  | 'DeleteApps'
  | 'PushNotifications'
  | 'ManageResources';

interface Role {
  Member: Permission[];
  AppEditor: Permission[];
  Maintainer: Permission[];
  Owner: Permission[];
}

export function compileFilters(mapperString: string, context?: Context): MapperFunction;

export function remapData(mapperData: any, inputData: any, context?: Context): any;

export function normalize(input: string, keepTrailingDash?: false): string;
export const normalized: RegExp;
export const partialNormalized: RegExp;

export type IdentifiableBlock = Pick<Block, 'type' | 'version'>;

export function normalizeBlockName(blockName: string): string;

export function getAppBlocks(definition: AppDefinition): Block[];

export function filterBlocks(blocks: IdentifiableBlock[]): IdentifiableBlock[];

export function validate(schema: OpenAPIV3.SchemaObject, data: any): Promise<void>;
export class SchemaValidationError extends Error {
  data: string[];
}

export function validateStyle(css: string): string;
export class StyleValidationError extends Error {}

export const baseTheme: Theme;
export const scopes: string[];
export const roles: Role;
export const permissions: {
  ViewApps: 'ViewApps';
  ManageRoles: 'ManageRoles';
  ManageMembers: 'ManageMembers';
  PublishBlocks: 'PublishBlocks';
  CreateApps: 'CreateApps';
  EditApps: 'EditApps';
  EditAppSettings: 'EditAppSettings';
  EditThemes: 'EditThemes';
  DeleteApps: 'DeleteApps';
  PushNotifications: 'PushNotifications';
  ManageResources: 'ManageResources';
};

export function checkAppRole(securityDefinition: Security, role: string, userRole: string): boolean;
