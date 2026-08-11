import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Providers } from '@/hr360-app/app/providers';
import { router } from '@/hr360-app/app/router';
import '@/hr360-app/styles/theme.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
);
