import React from 'react';
import Main from '../views/Main'; //
import Login from '../views/Login';
import Signup from '../views/Signup';
import RecipePublic from "../views/RecipePublic";
import Confirm from '../views/Confirm';
import AcceptInvitation from '../views/AcceptInvitation';
import Getconfirm from '../views/Getconfirm';
import NewPass from '../views/NewPass';
import ResetPass from '../views/ResetPass';


export default {
  '/':                                        { section: 'main', name: 'main',       render: <Main />             },
  '/lpu/:lpu/locations':                      { section: 'lpu',  name: 'locations',  render: <Main />             },

  '/login':                                   { section: 'auth', name: 'auth',       render: <Login />            },
  '/signup':                                  { section: 'auth', name: 'auth',       render: <Signup/>            },
  '/confirm':                                 { section: 'auth', name: 'auth',       render: <Confirm/>           },
  '/acceptinvitation/:code/:email/:service':  { section: 'auth', name: 'auth',       render: <AcceptInvitation/>  },
  '/getconfirm':                              { section: 'auth', name: 'auth',       render: <Getconfirm/>        },
  '/confirm/:code/:email/:service':           { section: 'auth', name: 'auth',       render: <Confirm/>           },

  '/resetpass':                               { section: 'auth', name: 'auth',       render: <ResetPass/>         },
  '/newpass/:code/:email/:service':           { section: 'auth', name: 'auth',       render: <NewPass/>           },
  '/newpass':                                 { section: 'auth', name: 'auth',       render: <NewPass/>           },

  '/orders/list':                             { section: 'main', name: 'orders',     render: <Main/>              },

  '/store/:page':                             { section: 'main', name: 'store',      render: <Main/>              },

  '/staff/list':                              { section: 'main', name: 'staff',      render: <Main/>              },

  '/pharms/list':                             { section: 'main', name: 'pharms',     render: <Main/>              },
  '/pharms/list/:netId':                      { section: 'main', name: 'pharms',     render: <Main/>              },
  '/pharms/net/:netId/license/:license':      { section: 'main', name: 'license',    render: <Main/>              },
  '/pharms/nets':                             { section: 'main', name: 'nets',       render: <Main/>              },

  '/profile':                                 { section: 'main', name: 'profile',    render: <Main/>              },

  '/recipe':                                  { section: 'main', name: 'recipe',     render: <Main/>              },
  '/recipe/search':                           { section: 'main', name: 'recipe',     render: <Main/>              },
  '/recipe/:code':                            { section: 'main', name: 'recipe',     render: <Main/>              },

  "/recipe-public":                           { section: "public", name: "recipe",   render: <RecipePublic />     },
  "/recipe-public/:code":                     { section: "public", name: "recipe",   render: <RecipePublic />     },


  '/ecp':                                     { section: 'main', name: 'ecp',        render: <Main/>              },

}
