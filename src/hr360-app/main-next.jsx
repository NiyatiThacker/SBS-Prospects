import { RouterProvider } from 'react-router-dom';
import { Providers } from './app/providers';
import { router } from './app/router';
import './styles/theme.css';

export default function HrApp() {
  return (
    <div id="hr360-root">
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </div>
  );
}
