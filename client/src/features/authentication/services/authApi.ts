import { baseApi } from "../../../core/api/baseApi"
import type { IUser } from "../../../core/types.ts"

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        register: builder.mutation<{ success: boolean; user: IUser }, any>({
            query: (body) => ({
                url: "/auth/register",
                method: "POST",
                body
            }),
            invalidatesTags: ["User"]
        }),
        login: builder.mutation<{ success: boolean; is2FARequired?: boolean; user?: IUser }, any>({
            query: (body) => ({
                url: "/auth/login",
                method: "POST",
                body
            }),
            invalidatesTags: ["User"]
        }),
        getCurrentUser: builder.query<{ success: boolean; user: IUser }, void>({
            query: () => "/auth/me",
            providesTags: ["User"]
        })
    })
})

export const { useRegisterMutation, useLoginMutation, useGetCurrentUserQuery } = authApi