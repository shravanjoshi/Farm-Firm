import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import Layout from "./components/Layout";
import Home from "./components/Home";
import LoginPage from "./components/LoginPage";
import Signup from "./components/Signup";
import ErrorPage from "./components/ErrorPage";
import { AuthProvider } from "./components/AuthContext";
import CropPage from "./components/CropPage";
import AddCrop from "./components/AddCrop";
import ListedCrops from "./components/ListedCrops";
import ProtectedRoute from "./components/ProtectedRoute";
import CropDetails from "./components/CropDetails";
import MyRequests from "./components/MyRequests";
import FarmerRequests from "./components/FarmerRequests"
import Profile from "./components/Profile";
import AllRequests from "./components/AllRequests";
function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { index: true, element: <Home/> }, // Public route

        {
          path:"/crops",
          element:(
            
              <CropPage />
          )
        },
        {
          path:"/add-crop",
          element:(
            <ProtectedRoute>
          <AddCrop/>
          </ProtectedRoute>
        )
        },
         {
          path:"/listed-crops",
          element:(
            <ProtectedRoute>
          <ListedCrops/>
            </ProtectedRoute>
          )
        },
            {
              path:"/crop-details/:cropId",
              element:(
                <ProtectedRoute>
                  <CropDetails/>
                </ProtectedRoute>
              )
            },
  {
          path:"/requests",
          element:(
            <ProtectedRoute>
            <MyRequests/>
            </ProtectedRoute>
          )
        },
  {
          path:"/requested-crops",
          element:(
            <ProtectedRoute>
            <FarmerRequests/>
            </ProtectedRoute>
          )
        },
  {
          path:"/profile",
          element:(
            <ProtectedRoute>
            <Profile />
            </ProtectedRoute>
          )
        },
        {
          path:"/allrequests",
          element:(
              <AllRequests/>
          )
        },


        { path: "/signup", element: <Signup /> }, // Public route
        { path: "/login-page", element: <LoginPage /> }, // Public route
      ],
    },
    { path: "*", element: <ErrorPage /> },
  ]);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;