import React from 'react';
import { Image } from 'react-bootstrap';

// This isn't a secret. Facebook requires access tokens to request profile
// pictures now. You can use a generic, public facing app Client token,
// which is what this is.
//
// See https://developers.facebook.com/docs/graph-api/reference/user/picture/
const accessToken = 'access_token=74742160840|c90b3363a3c0835669a83e1735074db8';

export default function ProfileImage({ fbId, size = 'normal', ...rest }) {
  return (
    <Image
      src={`https://graph.facebook.com/${fbId}/picture?type=${size}&${accessToken}`}
      {...rest}
    />
  );
}
