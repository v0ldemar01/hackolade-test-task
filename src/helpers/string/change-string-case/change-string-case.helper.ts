import { camelCase, Options, paramCase, snakeCase } from 'change-case';
import { StringCase } from '~/common/enums/enums.js';

const caseTypeToFn: Record<StringCase, typeof paramCase> = {
  [StringCase.KEBAB_CASE]: paramCase,
  [StringCase.SNAKE_CASE]: snakeCase,
  [StringCase.CAMEL_CASE]: camelCase,
};

const changeStringCase = (params: {
  stringToChange: string;
  caseType: StringCase;
  options?: Options;
}): string => {
  const getChangedStringCase = caseTypeToFn[params.caseType];

  return getChangedStringCase(params.stringToChange, params.options);
};

export { changeStringCase };
