import { baseApi } from "../../../core/api/baseApi"
import type { IUser } from "../../../core/types"

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        register: builder.mutation<{ success: boolean; user: IUser }, { name: string; email: string; password: string }>({
            query: (body) => ({
                url: "/auth/register",
                method: "POST",
                body
            }),
            invalidatesTags: ["User"]
        }),
        login: builder.mutation<{ success: boolean; is2FARequired?: boolean; message?: string; user?: IUser }, { email: string; password: string }>({
            query: (body) => ({
                url: "/auth/login",
                method: "POST",
                body
            }),
            invalidatesTags: ["User"]
        }),
        request2FAOTP: builder.mutation<{ success: boolean; message: string }, void>({
            query: () => ({
                url: "/auth/request-2fa-otp",
                method: "POST"
            })
        }),
        verify2FAToggle: builder.mutation<{ success: boolean; isTwoFactorEnabled: boolean }, { otp: string }>({
            query: (body) => ({
                url: "/auth/verify-2fa-toggle",
                method: "POST",
                body
            }),
            invalidatesTags: ["User"]
        }),
        disable2FA: builder.mutation<{ success: boolean; isTwoFactorEnabled: boolean }, void>({
            query: () => ({
                url: "/auth/disable-2fa",
                method: "POST"
            }),
            invalidatesTags: ["User"]
        }),
        getCurrentUser: builder.query<{ success: boolean; user: IUser }, void>({
            query: () => "/auth/me",
            providesTags: ["User"]
        }),
        logout: builder.mutation<{ success: boolean }, void>({
            query: () => ({
                url: "/auth/logout",
                method: "POST"
            }),
            invalidatesTags: ["User"]
        })
    })
})

export const {
    useRegisterMutation,
    useLoginMutation,
    useRequest2FAOTPMutation,
    useVerify2FAToggleMutation,
    useDisable2FAMutation,
    useGetCurrentUserQuery,
    useLogoutMutation
} = authApi