import { HttpStatus, NotAcceptableException } from '@nestjs/common';
import { extname } from 'path';
import { v4 as uuidV4 } from 'uuid';

const extensions = 'jpg|jpeg|png|gif|webp';

export const imageFileFilter = (_req, file, callback) => {
  if (!file.originalname.match(`\.(${extensions})$`)) {
    return callback(
      new NotAcceptableException({
        statusCode: HttpStatus.NOT_ACCEPTABLE,
        fields: {
          [file.fieldname]: `Just image can be accepted. Try one of this list ${extensions} - (${file.originalname})`,
        },
        error: 'Not Acceptable',
      }),
    );
  }
  callback(null, true);
};

export const editFileName = (_req, file, callback) => {
  const fileExtName = extname(file.originalname);
  const uuid = uuidV4();
  callback(null, `${uuid}${fileExtName}`);
};

export const getImageExtension = (fileName: string) => {
  return extname(fileName);
};

export interface FileImage {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}
