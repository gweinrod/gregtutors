/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "(pages-dir-node)/./src/lib/auth.js":
/*!*************************!*\
  !*** ./src/lib/auth.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Authenticator: () => (/* binding */ Authenticator),\n/* harmony export */   fillContext: () => (/* binding */ fillContext),\n/* harmony export */   updateContext: () => (/* binding */ updateContext)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/router */ \"(pages-dir-node)/./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _supabase__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./supabase */ \"(pages-dir-node)/./src/lib/supabase.js\");\n\n\n\n\n// Create context for authentication\nconst AuthContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)();\nfunction Authenticator({ children, context }) {\n    const [user, setUser] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(true);\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_2__.useRouter)();\n    // Check for authentication on mount and auth changes\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)({\n        \"Authenticator.useEffect\": ()=>{\n            // Get initial session\n            const getInitialSession = {\n                \"Authenticator.useEffect.getInitialSession\": async ()=>{\n                    const { data: { session } } = await _supabase__WEBPACK_IMPORTED_MODULE_3__.supabase.auth.getSession();\n                    if (session?.user) {\n                        const profile = await _supabase__WEBPACK_IMPORTED_MODULE_3__.dataService.getUserProfile(session.user.id);\n                        setUser({\n                            id: session.user.id,\n                            email: session.user.email,\n                            name: profile?.name || session.user.email\n                        });\n                    }\n                    setLoading(false);\n                }\n            }[\"Authenticator.useEffect.getInitialSession\"];\n            getInitialSession();\n            // Listen for auth changes\n            const { data: { subscription } } = _supabase__WEBPACK_IMPORTED_MODULE_3__.supabase.auth.onAuthStateChange({\n                \"Authenticator.useEffect\": async (event, session)=>{\n                    if (session?.user) {\n                        const profile = await _supabase__WEBPACK_IMPORTED_MODULE_3__.dataService.getUserProfile(session.user.id);\n                        setUser({\n                            id: session.user.id,\n                            email: session.user.email,\n                            name: profile?.name || session.user.email\n                        });\n                    } else {\n                        setUser(null);\n                    }\n                    setLoading(false);\n                }\n            }[\"Authenticator.useEffect\"]);\n            return ({\n                \"Authenticator.useEffect\": ()=>subscription.unsubscribe()\n            })[\"Authenticator.useEffect\"];\n        }\n    }[\"Authenticator.useEffect\"], []);\n    // Login\n    const login = async (credentials)=>{\n        try {\n            const { data, error } = await _supabase__WEBPACK_IMPORTED_MODULE_3__.supabase.auth.signInWithPassword({\n                email: credentials.email,\n                password: credentials.password\n            });\n            if (error) {\n                return {\n                    error: error.message\n                };\n            }\n            return {\n                success: true\n            };\n        } catch (error) {\n            console.error('Login error:', error);\n            return {\n                error: 'An unexpected error occurred'\n            };\n        }\n    };\n    // Logout function\n    const logout = async ()=>{\n        try {\n            await _supabase__WEBPACK_IMPORTED_MODULE_3__.supabase.auth.signOut();\n            setUser(null);\n            // Route to Home\n            if (router.pathname !== '/') {\n                router.replace('/');\n            }\n        } catch (error) {\n            console.error('Logout error:', error);\n        }\n    };\n    // Application context is user dependent\n    const authContextValue = {\n        user,\n        login,\n        logout,\n        loading,\n        context\n    };\n    // Authorize and return the updated context\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(AuthContext.Provider, {\n        value: authContextValue,\n        children: children\n    }, void 0, false, {\n        fileName: \"/home/project/src/lib/auth.js\",\n        lineNumber: 97,\n        columnNumber: 5\n    }, this);\n}\n// Hook passed directly above, refresh authentication and use it to perform an action\nfunction updateContext() {\n    const context = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(AuthContext);\n    if (context === undefined) {\n        throw new Error('updateContext must be used within an Authenticator');\n    }\n    return context;\n}\n// Helper for interacting with local authentication\nasync function fillContext(context) {\n    try {\n        // For server-side rendering, we need to check if there's a session\n        // This is a simplified version - in production you'd want to verify the session server-side\n        return {\n            user: null\n        };\n    } catch (error) {\n        console.error('Auth validation error:', error);\n        return {\n            user: null\n        };\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0FRO1FBQ0F6QjtRQUNBSDtJQUNGO0lBRUEsMkNBQTJDO0lBQzNDLHFCQUNFLDhEQUFDSCxZQUFZb0MsUUFBUTtRQUFDQyxPQUFPRjtrQkFDMUJqQzs7Ozs7O0FBR1A7QUFFQSxxRkFBcUY7QUFDOUUsU0FBU29DO0lBQ2QsTUFBTW5DLFVBQVVQLGlEQUFVQSxDQUFDSTtJQUMzQixJQUFJRyxZQUFZb0MsV0FBVztRQUN6QixNQUFNLElBQUlDLE1BQU07SUFDbEI7SUFDQSxPQUFPckM7QUFDVDtBQUVBLG1EQUFtRDtBQUM1QyxlQUFlc0MsWUFBWXRDLE9BQU87SUFDdkMsSUFBSTtRQUNGLG1FQUFtRTtRQUNuRSw0RkFBNEY7UUFDNUYsT0FBTztZQUFFQyxNQUFNO1FBQUs7SUFDdEIsRUFBRSxPQUFPcUIsT0FBTztRQUNkSyxRQUFRTCxLQUFLLENBQUMsMEJBQTBCQTtRQUN4QyxPQUFPO1lBQUVyQixNQUFNO1FBQUs7SUFDdEI7QUFDRiIsInNvdXJjZXMiOlsiL2hvbWUvcHJvamVjdC9zcmMvbGliL2F1dGguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgY3JlYXRlQ29udGV4dCwgdXNlQ29udGV4dCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZVJvdXRlciB9IGZyb20gJ25leHQvcm91dGVyJztcbmltcG9ydCB7IHN1cGFiYXNlLCBkYXRhU2VydmljZSB9IGZyb20gJy4vc3VwYWJhc2UnO1xuXG4vLyBDcmVhdGUgY29udGV4dCBmb3IgYXV0aGVudGljYXRpb25cbmNvbnN0IEF1dGhDb250ZXh0ID0gY3JlYXRlQ29udGV4dCgpO1xuXG5leHBvcnQgZnVuY3Rpb24gQXV0aGVudGljYXRvcih7IGNoaWxkcmVuLCBjb250ZXh0IH0pIHtcbiAgY29uc3QgW3VzZXIsIHNldFVzZXJdID0gdXNlU3RhdGUobnVsbCk7XG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xuICBjb25zdCByb3V0ZXIgPSB1c2VSb3V0ZXIoKTtcblxuICAvLyBDaGVjayBmb3IgYXV0aGVudGljYXRpb24gb24gbW91bnQgYW5kIGF1dGggY2hhbmdlc1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIC8vIEdldCBpbml0aWFsIHNlc3Npb25cbiAgICBjb25zdCBnZXRJbml0aWFsU2Vzc2lvbiA9IGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IHsgZGF0YTogeyBzZXNzaW9uIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0U2Vzc2lvbigpO1xuICAgICAgXG4gICAgICBpZiAoc2Vzc2lvbj8udXNlcikge1xuICAgICAgICBjb25zdCBwcm9maWxlID0gYXdhaXQgZGF0YVNlcnZpY2UuZ2V0VXNlclByb2ZpbGUoc2Vzc2lvbi51c2VyLmlkKTtcbiAgICAgICAgc2V0VXNlcih7XG4gICAgICAgICAgaWQ6IHNlc3Npb24udXNlci5pZCxcbiAgICAgICAgICBlbWFpbDogc2Vzc2lvbi51c2VyLmVtYWlsLFxuICAgICAgICAgIG5hbWU6IHByb2ZpbGU/Lm5hbWUgfHwgc2Vzc2lvbi51c2VyLmVtYWlsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgfTtcblxuICAgIGdldEluaXRpYWxTZXNzaW9uKCk7XG5cbiAgICAvLyBMaXN0ZW4gZm9yIGF1dGggY2hhbmdlc1xuICAgIGNvbnN0IHsgZGF0YTogeyBzdWJzY3JpcHRpb24gfSB9ID0gc3VwYWJhc2UuYXV0aC5vbkF1dGhTdGF0ZUNoYW5nZShcbiAgICAgIGFzeW5jIChldmVudCwgc2Vzc2lvbikgPT4ge1xuICAgICAgICBpZiAoc2Vzc2lvbj8udXNlcikge1xuICAgICAgICAgIGNvbnN0IHByb2ZpbGUgPSBhd2FpdCBkYXRhU2VydmljZS5nZXRVc2VyUHJvZmlsZShzZXNzaW9uLnVzZXIuaWQpO1xuICAgICAgICAgIHNldFVzZXIoe1xuICAgICAgICAgICAgaWQ6IHNlc3Npb24udXNlci5pZCxcbiAgICAgICAgICAgIGVtYWlsOiBzZXNzaW9uLnVzZXIuZW1haWwsXG4gICAgICAgICAgICBuYW1lOiBwcm9maWxlPy5uYW1lIHx8IHNlc3Npb24udXNlci5lbWFpbFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNldFVzZXIobnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIHJldHVybiAoKSA9PiBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgfSwgW10pO1xuXG4gIC8vIExvZ2luXG4gIGNvbnN0IGxvZ2luID0gYXN5bmMgKGNyZWRlbnRpYWxzKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguc2lnbkluV2l0aFBhc3N3b3JkKHtcbiAgICAgICAgZW1haWw6IGNyZWRlbnRpYWxzLmVtYWlsLFxuICAgICAgICBwYXNzd29yZDogY3JlZGVudGlhbHMucGFzc3dvcmQsXG4gICAgICB9KTtcblxuICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgIHJldHVybiB7IGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignTG9naW4gZXJyb3I6JywgZXJyb3IpO1xuICAgICAgcmV0dXJuIHsgZXJyb3I6ICdBbiB1bmV4cGVjdGVkIGVycm9yIG9jY3VycmVkJyB9O1xuICAgIH1cbiAgfTtcblxuICAvLyBMb2dvdXQgZnVuY3Rpb25cbiAgY29uc3QgbG9nb3V0ID0gYXN5bmMgKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBzdXBhYmFzZS5hdXRoLnNpZ25PdXQoKTtcbiAgICAgIHNldFVzZXIobnVsbCk7XG4gICAgICBcbiAgICAgIC8vIFJvdXRlIHRvIEhvbWVcbiAgICAgIGlmIChyb3V0ZXIucGF0aG5hbWUgIT09ICcvJykge1xuICAgICAgICByb3V0ZXIucmVwbGFjZSgnLycpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdMb2dvdXQgZXJyb3I6JywgZXJyb3IpO1xuICAgIH1cbiAgfTtcblxuICAvLyBBcHBsaWNhdGlvbiBjb250ZXh0IGlzIHVzZXIgZGVwZW5kZW50XG4gIGNvbnN0IGF1dGhDb250ZXh0VmFsdWUgPSB7XG4gICAgdXNlcixcbiAgICBsb2dpbixcbiAgICBsb2dvdXQsXG4gICAgbG9hZGluZyxcbiAgICBjb250ZXh0XG4gIH07XG5cbiAgLy8gQXV0aG9yaXplIGFuZCByZXR1cm4gdGhlIHVwZGF0ZWQgY29udGV4dFxuICByZXR1cm4gKFxuICAgIDxBdXRoQ29udGV4dC5Qcm92aWRlciB2YWx1ZT17YXV0aENvbnRleHRWYWx1ZX0+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9BdXRoQ29udGV4dC5Qcm92aWRlcj5cbiAgKTtcbn1cblxuLy8gSG9vayBwYXNzZWQgZGlyZWN0bHkgYWJvdmUsIHJlZnJlc2ggYXV0aGVudGljYXRpb24gYW5kIHVzZSBpdCB0byBwZXJmb3JtIGFuIGFjdGlvblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUNvbnRleHQoKSB7XG4gIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KEF1dGhDb250ZXh0KTtcbiAgaWYgKGNvbnRleHQgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFcnJvcigndXBkYXRlQ29udGV4dCBtdXN0IGJlIHVzZWQgd2l0aGluIGFuIEF1dGhlbnRpY2F0b3InKTtcbiAgfVxuICByZXR1cm4gY29udGV4dDtcbn1cblxuLy8gSGVscGVyIGZvciBpbnRlcmFjdGluZyB3aXRoIGxvY2FsIGF1dGhlbnRpY2F0aW9uXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmlsbENvbnRleHQoY29udGV4dCkge1xuICB0cnkge1xuICAgIC8vIEZvciBzZXJ2ZXItc2lkZSByZW5kZXJpbmcsIHdlIG5lZWQgdG8gY2hlY2sgaWYgdGhlcmUncyBhIHNlc3Npb25cbiAgICAvLyBUaGlzIGlzIGEgc2ltcGxpZmllZCB2ZXJzaW9uIC0gaW4gcHJvZHVjdGlvbiB5b3UnZCB3YW50IHRvIHZlcmlmeSB0aGUgc2Vzc2lvbiBzZXJ2ZXItc2lkZVxuICAgIHJldHVybiB7IHVzZXI6IG51bGwgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdBdXRoIHZhbGlkYXRpb24gZXJyb3I6JywgZXJyb3IpO1xuICAgIHJldHVybiB7IHVzZXI6IG51bGwgfTtcbiAgfVxufSJdLCJuYW1lcyI6WyJ1c2VTdGF0ZSIsInVzZUVmZmVjdCIsImNyZWF0ZUNvbnRleHQiLCJ1c2VDb250ZXh0IiwidXNlUm91dGVyIiwic3VwYWJhc2UiLCJkYXRhU2VydmljZSIsIkF1dGhDb250ZXh0IiwiQXV0aGVudGljYXRvciIsImNoaWxkcmVuIiwiY29udGV4dCIsInVzZXIiLCJzZXRVc2VyIiwibG9hZGluZyIsInNldExvYWRpbmciLCJyb3V0ZXIiLCJnZXRJbml0aWFsU2Vzc2lvbiIsImRhdGEiLCJzZXNzaW9uIiwiYXV0aCIsImdldFNlc3Npb24iLCJwcm9maWxlIiwiZ2V0VXNlclByb2ZpbGUiLCJpZCIsImVtYWlsIiwibmFtZSIsInN1YnNjcmlwdGlvbiIsIm9uQXV0aFN0YXRlQ2hhbmdlIiwiZXZlbnQiLCJ1bnN1YnNjcmliZSIsImxvZ2luIiwiY3JlZGVudGlhbHMiLCJlcnJvciIsInNpZ25JbldpdGhQYXNzd29yZCIsInBhc3N3b3JkIiwibWVzc2FnZSIsInN1Y2Nlc3MiLCJjb25zb2xlIiwibG9nb3V0Iiwic2lnbk91dCIsInBhdGhuYW1lIiwicmVwbGFjZSIsImF1dGhDb250ZXh0VmFsdWUiLCJQcm92aWRlciIsInZhbHVlIiwidXBkYXRlQ29udGV4dCIsInVuZGVmaW5lZCIsIkVycm9yIiwiZmlsbENvbnRleHQiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(pages-dir-node)/./src/lib/auth.js\n");

/***/ }),

/***/ "(pages-dir-node)/./src/lib/supabase.js":
/*!*****************************!*\
  !*** ./src/lib/supabase.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   dataService: () => (/* binding */ dataService),\n/* harmony export */   supabase: () => (/* binding */ supabase)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/supabase-js */ \"@supabase/supabase-js\");\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__);\n\nconst supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;\nconst supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;\nif (!supabaseUrl || !supabaseAnonKey) {\n    throw new Error('Missing Supabase environment variables');\n}\nconst supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(supabaseUrl, supabaseAnonKey);\n// Helper functions for data fetching\nconst dataService = {\n    // Fetch reviews\n    async getReviews (count = 3) {\n        try {\n            const { data, error } = await supabase.from('reviews').select('quote, client').eq('is_active', true).limit(count);\n            if (error) {\n                console.error('Error fetching reviews:', error);\n                return [];\n            }\n            return data || [];\n        } catch (error) {\n            console.error('Error fetching reviews:', error);\n            return [];\n        }\n    },\n    // Fetch quotes\n    async getQuotes (count = 3) {\n        try {\n            const { data, error } = await supabase.from('quotes').select('text, author').eq('is_active', true).limit(count);\n            if (error) {\n                console.error('Error fetching quotes:', error);\n                return [];\n            }\n            return data || [];\n        } catch (error) {\n            console.error('Error fetching quotes:', error);\n            return [];\n        }\n    },\n    // Get user profile\n    async getUserProfile (userId) {\n        try {\n            const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();\n            if (error) {\n                console.error('Error fetching user profile:', error);\n                return null;\n            }\n            return data;\n        } catch (error) {\n            console.error('Error fetching user profile:', error);\n            return null;\n        }\n    },\n    // Get schedule access for user\n    async getScheduleAccess (userId) {\n        try {\n            const { data, error } = await supabase.from('profiles').select('has_schedule_access').eq('id', userId).single();\n            if (error) {\n                console.error('Error fetching schedule access:', error);\n                return false;\n            }\n            return data?.has_schedule_access || false;\n        } catch (error) {\n            console.error('Error fetching schedule access:', error);\n            return false;\n        }\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL3NyYy9saWIvc3VwYWJhc2UuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFxRDtBQUVyRCxNQUFNQyxjQUFjQyxRQUFRQyxHQUFHLENBQUNDLHdCQUF3QjtBQUN4RCxNQUFNQyxrQkFBa0JILFFBQVFDLEdBQUcsQ0FBQ0csNkJBQTZCO0FBRWpFLElBQUksQ0FBQ0wsZUFBZSxDQUFDSSxpQkFBaUI7SUFDcEMsTUFBTSxJQUFJRSxNQUFNO0FBQ2xCO0FBRU8sTUFBTUMsV0FBV1IsbUVBQVlBLENBQUNDLGFBQWFJLGlCQUFpQjtBQUVuRSxxQ0FBcUM7QUFDOUIsTUFBTUksY0FBYztJQUN6QixnQkFBZ0I7SUFDaEIsTUFBTUMsWUFBV0MsUUFBUSxDQUFDO1FBQ3hCLElBQUk7WUFDRixNQUFNLEVBQUVDLElBQUksRUFBRUMsS0FBSyxFQUFFLEdBQUcsTUFBTUwsU0FDM0JNLElBQUksQ0FBQyxXQUNMQyxNQUFNLENBQUMsaUJBQ1BDLEVBQUUsQ0FBQyxhQUFhLE1BQ2hCQyxLQUFLLENBQUNOO1lBRVQsSUFBSUUsT0FBTztnQkFDVEssUUFBUUwsS0FBSyxDQUFDLDJCQUEyQkE7Z0JBQ3pDLE9BQU8sRUFBRTtZQUNYO1lBRUEsT0FBT0QsUUFBUSxFQUFFO1FBQ25CLEVBQUUsT0FBT0MsT0FBTztZQUNkSyxRQUFRTCxLQUFLLENBQUMsMkJBQTJCQTtZQUN6QyxPQUFPLEVBQUU7UUFDWDtJQUNGO0lBRUEsZUFBZTtJQUNmLE1BQU1NLFdBQVVSLFFBQVEsQ0FBQztRQUN2QixJQUFJO1lBQ0YsTUFBTSxFQUFFQyxJQUFJLEVBQUVDLEtBQUssRUFBRSxHQUFHLE1BQU1MLFNBQzNCTSxJQUFJLENBQUMsVUFDTEMsTUFBTSxDQUFDLGdCQUNQQyxFQUFFLENBQUMsYUFBYSxNQUNoQkMsS0FBSyxDQUFDTjtZQUVULElBQUlFLE9BQU87Z0JBQ1RLLFFBQVFMLEtBQUssQ0FBQywwQkFBMEJBO2dCQUN4QyxPQUFPLEVBQUU7WUFDWDtZQUVBLE9BQU9ELFFBQVEsRUFBRTtRQUNuQixFQUFFLE9BQU9DLE9BQU87WUFDZEssUUFBUUwsS0FBSyxDQUFDLDBCQUEwQkE7WUFDeEMsT0FBTyxFQUFFO1FBQ1g7SUFDRjtJQUVBLG1CQUFtQjtJQUNuQixNQUFNTyxnQkFBZUMsTUFBTTtRQUN6QixJQUFJO1lBQ0YsTUFBTSxFQUFFVCxJQUFJLEVBQUVDLEtBQUssRUFBRSxHQUFHLE1BQU1MLFNBQzNCTSxJQUFJLENBQUMsWUFDTEMsTUFBTSxDQUFDLEtBQ1BDLEVBQUUsQ0FBQyxNQUFNSyxRQUNUQyxNQUFNO1lBRVQsSUFBSVQsT0FBTztnQkFDVEssUUFBUUwsS0FBSyxDQUFDLGdDQUFnQ0E7Z0JBQzlDLE9BQU87WUFDVDtZQUVBLE9BQU9EO1FBQ1QsRUFBRSxPQUFPQyxPQUFPO1lBQ2RLLFFBQVFMLEtBQUssQ0FBQyxnQ0FBZ0NBO1lBQzlDLE9BQU87UUFDVDtJQUNGO0lBRUEsK0JBQStCO0lBQy9CLE1BQU1VLG1CQUFrQkYsTUFBTTtRQUM1QixJQUFJO1lBQ0YsTUFBTSxFQUFFVCxJQUFJLEVBQUVDLEtBQUssRUFBRSxHQUFHLE1BQU1MLFNBQzNCTSxJQUFJLENBQUMsWUFDTEMsTUFBTSxDQUFDLHVCQUNQQyxFQUFFLENBQUMsTUFBTUssUUFDVEMsTUFBTTtZQUVULElBQUlULE9BQU87Z0JBQ1RLLFFBQVFMLEtBQUssQ0FBQyxtQ0FBbUNBO2dCQUNqRCxPQUFPO1lBQ1Q7WUFFQSxPQUFPRCxNQUFNWSx1QkFBdUI7UUFDdEMsRUFBRSxPQUFPWCxPQUFPO1lBQ2RLLFFBQVFMLEtBQUssQ0FBQyxtQ0FBbUNBO1lBQ2pELE9BQU87UUFDVDtJQUNGO0FBQ0YsRUFBRSIsInNvdXJjZXMiOlsiL2hvbWUvcHJvamVjdC9zcmMvbGliL3N1cGFiYXNlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcyc7XG5cbmNvbnN0IHN1cGFiYXNlVXJsID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMO1xuY29uc3Qgc3VwYWJhc2VBbm9uS2V5ID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVk7XG5cbmlmICghc3VwYWJhc2VVcmwgfHwgIXN1cGFiYXNlQW5vbktleSkge1xuICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgU3VwYWJhc2UgZW52aXJvbm1lbnQgdmFyaWFibGVzJyk7XG59XG5cbmV4cG9ydCBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudChzdXBhYmFzZVVybCwgc3VwYWJhc2VBbm9uS2V5KTtcblxuLy8gSGVscGVyIGZ1bmN0aW9ucyBmb3IgZGF0YSBmZXRjaGluZ1xuZXhwb3J0IGNvbnN0IGRhdGFTZXJ2aWNlID0ge1xuICAvLyBGZXRjaCByZXZpZXdzXG4gIGFzeW5jIGdldFJldmlld3MoY291bnQgPSAzKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXG4gICAgICAgIC5mcm9tKCdyZXZpZXdzJylcbiAgICAgICAgLnNlbGVjdCgncXVvdGUsIGNsaWVudCcpXG4gICAgICAgIC5lcSgnaXNfYWN0aXZlJywgdHJ1ZSlcbiAgICAgICAgLmxpbWl0KGNvdW50KTtcblxuICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHJldmlld3M6JywgZXJyb3IpO1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkYXRhIHx8IFtdO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyByZXZpZXdzOicsIGVycm9yKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gRmV0Y2ggcXVvdGVzXG4gIGFzeW5jIGdldFF1b3Rlcyhjb3VudCA9IDMpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBkYXRhLCBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgICAgLmZyb20oJ3F1b3RlcycpXG4gICAgICAgIC5zZWxlY3QoJ3RleHQsIGF1dGhvcicpXG4gICAgICAgIC5lcSgnaXNfYWN0aXZlJywgdHJ1ZSlcbiAgICAgICAgLmxpbWl0KGNvdW50KTtcblxuICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHF1b3RlczonLCBlcnJvcik7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRhdGEgfHwgW107XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHF1b3RlczonLCBlcnJvcik7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICB9LFxuXG4gIC8vIEdldCB1c2VyIHByb2ZpbGVcbiAgYXN5bmMgZ2V0VXNlclByb2ZpbGUodXNlcklkKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXG4gICAgICAgIC5mcm9tKCdwcm9maWxlcycpXG4gICAgICAgIC5zZWxlY3QoJyonKVxuICAgICAgICAuZXEoJ2lkJywgdXNlcklkKVxuICAgICAgICAuc2luZ2xlKCk7XG5cbiAgICAgIGlmIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyB1c2VyIHByb2ZpbGU6JywgZXJyb3IpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHVzZXIgcHJvZmlsZTonLCBlcnJvcik7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH0sXG5cbiAgLy8gR2V0IHNjaGVkdWxlIGFjY2VzcyBmb3IgdXNlclxuICBhc3luYyBnZXRTY2hlZHVsZUFjY2Vzcyh1c2VySWQpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBkYXRhLCBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgICAgLmZyb20oJ3Byb2ZpbGVzJylcbiAgICAgICAgLnNlbGVjdCgnaGFzX3NjaGVkdWxlX2FjY2VzcycpXG4gICAgICAgIC5lcSgnaWQnLCB1c2VySWQpXG4gICAgICAgIC5zaW5nbGUoKTtcblxuICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHNjaGVkdWxlIGFjY2VzczonLCBlcnJvcik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRhdGE/Lmhhc19zY2hlZHVsZV9hY2Nlc3MgfHwgZmFsc2U7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHNjaGVkdWxlIGFjY2VzczonLCBlcnJvcik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG59OyJdLCJuYW1lcyI6WyJjcmVhdGVDbGllbnQiLCJzdXBhYmFzZVVybCIsInByb2Nlc3MiLCJlbnYiLCJORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwiLCJzdXBhYmFzZUFub25LZXkiLCJORVhUX1BVQkxJQ19TVVBBQkFTRV9BTk9OX0tFWSIsIkVycm9yIiwic3VwYWJhc2UiLCJkYXRhU2VydmljZSIsImdldFJldmlld3MiLCJjb3VudCIsImRhdGEiLCJlcnJvciIsImZyb20iLCJzZWxlY3QiLCJlcSIsImxpbWl0IiwiY29uc29sZSIsImdldFF1b3RlcyIsImdldFVzZXJQcm9maWxlIiwidXNlcklkIiwic2luZ2xlIiwiZ2V0U2NoZWR1bGVBY2Nlc3MiLCJoYXNfc2NoZWR1bGVfYWNjZXNzIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(pages-dir-node)/./src/lib/supabase.js\n");

/***/ }),

/***/ "(pages-dir-node)/./src/pages/_app.js":
/*!***************************!*\
  !*** ./src/pages/_app.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/auth */ \"(pages-dir-node)/./src/lib/auth.js\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../styles/globals.css */ \"(pages-dir-node)/./src/styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_3__);\n\n\n\n\nfunction App({ Component, pageProps }) {\n    const [theme, setTheme] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)('light');\n    const context = {\n        theme,\n        setTheme,\n        siteTitle: process.env.NEXT_PUBLIC_SITE_TITLE || \"\"\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_lib_auth__WEBPACK_IMPORTED_MODULE_2__.Authenticator, {\n        context: context,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n            ...pageProps\n        }, void 0, false, {\n            fileName: \"/home/project/src/pages/_app.js\",\n            lineNumber: 11,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"/home/project/src/pages/_app.js\",\n        lineNumber: 10,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (App);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL3NyYy9wYWdlcy9fYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFpQztBQUNXO0FBQ2I7QUFFL0IsU0FBU0UsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLFNBQVMsRUFBRTtJQUNuQyxNQUFNLENBQUNDLE9BQU9DLFNBQVMsR0FBR04sK0NBQVFBLENBQUM7SUFDbkMsTUFBTU8sVUFBVTtRQUFFRjtRQUFPQztRQUFVRSxXQUFXQyxRQUFRQyxHQUFHLENBQUNDLHNCQUFzQixJQUFJO0lBQUc7SUFFdkYscUJBQ0UsOERBQUNWLG9EQUFhQTtRQUFDTSxTQUFTQTtrQkFDdEIsNEVBQUNKO1lBQVcsR0FBR0MsU0FBUzs7Ozs7Ozs7Ozs7QUFHOUI7QUFFQSxpRUFBZUYsR0FBR0EsRUFBQyIsInNvdXJjZXMiOlsiL2hvbWUvcHJvamVjdC9zcmMvcGFnZXMvX2FwcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEF1dGhlbnRpY2F0b3IgfSBmcm9tICcuLi9saWIvYXV0aCc7XG5pbXBvcnQgJy4uL3N0eWxlcy9nbG9iYWxzLmNzcyc7XG5cbmZ1bmN0aW9uIEFwcCh7IENvbXBvbmVudCwgcGFnZVByb3BzIH0pIHtcbiAgY29uc3QgW3RoZW1lLCBzZXRUaGVtZV0gPSB1c2VTdGF0ZSgnbGlnaHQnKTtcbiAgY29uc3QgY29udGV4dCA9IHsgdGhlbWUsIHNldFRoZW1lLCBzaXRlVGl0bGU6IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NJVEVfVElUTEUgfHwgXCJcIiB9O1xuXG4gIHJldHVybiAoXG4gICAgPEF1dGhlbnRpY2F0b3IgY29udGV4dD17Y29udGV4dH0+XG4gICAgICA8Q29tcG9uZW50IHsuLi5wYWdlUHJvcHN9IC8+XG4gICAgPC9BdXRoZW50aWNhdG9yPlxuICApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBBcHA7XG4iXSwibmFtZXMiOlsidXNlU3RhdGUiLCJBdXRoZW50aWNhdG9yIiwiQXBwIiwiQ29tcG9uZW50IiwicGFnZVByb3BzIiwidGhlbWUiLCJzZXRUaGVtZSIsImNvbnRleHQiLCJzaXRlVGl0bGUiLCJwcm9jZXNzIiwiZW52IiwiTkVYVF9QVUJMSUNfU0lURV9USVRMRSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(pages-dir-node)/./src/pages/_app.js\n");

/***/ }),

/***/ "(pages-dir-node)/./src/styles/globals.css":
/*!********************************!*\
  !*** ./src/styles/globals.css ***!
  \********************************/
/***/ (() => {



/***/ }),

/***/ "@supabase/supabase-js":
/*!****************************************!*\
  !*** external "@supabase/supabase-js" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("@supabase/supabase-js");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react-dom":
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-dom");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "react/jsx-runtime":
/*!************************************!*\
  !*** external "react/jsx-runtime" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc"], () => (__webpack_exec__("(pages-dir-node)/./src/pages/_app.js")));
module.exports = __webpack_exports__;

})();