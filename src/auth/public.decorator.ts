import { SetMetadata, CustomDecorator } from '@nestjs/common';

export const IS_PUBLIC = 'Public';

export const Public = (): CustomDecorator<string> =>
  SetMetadata(IS_PUBLIC, true);
