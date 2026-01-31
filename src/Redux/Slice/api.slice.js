import { createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../Apis/apiRequest";



const apiSlice = createSlice({
  name: "api",
  initialState: {
  countries:{ data: null, loading: false, error: null },
  carts:{ data: null, loading: false, error: null },
  categories:{data: null, loading: false, error: null},
  zones:{data: null, loading: false, error: null},
  CartSummery:{data: null, loading: false, error: null},
  social:{data: null, loading: false, error: null},
  stayTouch:{data: null, loading: false, error: null},
  contactus:{data: null, loading: false, error: null},
  aboutus:{data: null, loading: false, error: null},
  PaymentMethods:{data: null, loading: false, error: null},
  addPaymentContact:{data: null, loading: false, error: null},
  addPaymentMethod:{data: null, loading: false, error: null},
 offerBanner:{data: null, loading: false, error: null},
 productsDiscounts:{data: null, loading: false, error: null},
 cities:{data: null, loading: false, error: null},
 
  },
  reducers: {
    clearApiError: (state, action) => {
      const entity = action.payload;
      if (state[entity]) {
        state[entity].error = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(apiRequest.pending, (state, action) => {
        const { entity } = action.meta.arg;
        state[entity].loading = true;
        state[entity].error = null;
      })
      .addCase(apiRequest.fulfilled, (state, action) => {
        const { entity, data } = action.payload;
        state[entity].loading = false;
        state[entity].data = data;
      })
      .addCase(apiRequest.rejected, (state, action) => {
        //////console.log({ reject: action.payload.error });
        // toast.error(action.payload.error)

        const { entity } = action.payload;
        state[entity].loading = false;
        state[entity].error = action.payload.error;
      });
  },
});

export let apiReducer = apiSlice.reducer;
export const { clearApiError } = apiSlice.actions;
