import { SetMetadata, CustomDecorator } from '@nestjs/common';
import { Privilege } from './enum/privilege.enum';

export const PRIVILEGES = 'Privileges';

export const Privileges = (
  ...privileges: Privilege[]
): CustomDecorator<string> => SetMetadata(PRIVILEGES, privileges);
