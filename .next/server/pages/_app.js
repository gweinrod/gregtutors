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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Authenticator: () => (/* binding */ Authenticator),\n/* harmony export */   fillContext: () => (/* binding */ fillContext),\n/* harmony export */   updateContext: () => (/* binding */ updateContext)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/router */ \"(pages-dir-node)/./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var nookies__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! nookies */ \"nookies\");\n/* harmony import */ var nookies__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(nookies__WEBPACK_IMPORTED_MODULE_3__);\n\n\n\n\n//Create context for authentication\nconst AuthContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)();\nfunction Authenticator({ children, context }) {\n    const [user, setUser] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_2__.useRouter)();\n    //Check for client cookie authentication\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)({\n        \"Authenticator.useEffect\": ()=>{\n            const { token } = (0,nookies__WEBPACK_IMPORTED_MODULE_3__.parseCookies)();\n            if (token) {\n                //Client side update authentication\n                fetch('/api/token', {\n                    headers: {\n                        Authorization: `Bearer ${token}`\n                    }\n                }).then({\n                    \"Authenticator.useEffect\": (res)=>res.json()\n                }[\"Authenticator.useEffect\"]).then({\n                    \"Authenticator.useEffect\": (data)=>{\n                        if (data.user) {\n                            setUser(data.user);\n                        } else {\n                            setUser(null);\n                        }\n                    }\n                }[\"Authenticator.useEffect\"]).catch({\n                    \"Authenticator.useEffect\": ()=>{\n                        setUser(null);\n                    }\n                }[\"Authenticator.useEffect\"]);\n            } else {\n                setUser(null);\n            }\n        }\n    }[\"Authenticator.useEffect\"], []);\n    //Login\n    const login = async (credentials)=>{\n        try {\n            const res = await fetch('/api/login', {\n                method: 'POST',\n                headers: {\n                    'Content-Type': 'application/json'\n                },\n                body: JSON.stringify(credentials)\n            });\n            if (res.ok) {\n                const data = await res.json();\n                //Set authentication for 14 days, or end of session\n                (0,nookies__WEBPACK_IMPORTED_MODULE_3__.setCookie)(null, 'token', data.token, {\n                    maxAge: 7 * 24 * 60 * 60,\n                    path: '/'\n                });\n                setUser(data.user);\n                return {\n                    success: true\n                };\n            } else {\n                const error = await res.json();\n                return {\n                    error: error.message || 'Login failed'\n                };\n            }\n        } catch (error) {\n            console.error('Login error:', error);\n            return {\n                error: 'An unexpected error occurred'\n            };\n        }\n    };\n    //Logout function\n    const logout = async ()=>{\n        try {\n            //Delete current session's cookie\n            (0,nookies__WEBPACK_IMPORTED_MODULE_3__.destroyCookie)(null, 'token', {\n                path: '/'\n            });\n            //Notify server of logout\n            await fetch('/api/logout', {\n                method: 'POST'\n            });\n            setUser(null);\n            //Route to Home\n            if (router.pathname !== '/') {\n                router.replace('/');\n            }\n        } catch (error) {\n            console.error('Logout error:', error);\n        }\n    };\n    //Application context is user dependent\n    const authContextValue = {\n        user,\n        login,\n        logout,\n        context\n    };\n    //Authorize and return the updated context\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(AuthContext.Provider, {\n        value: authContextValue,\n        children: children\n    }, void 0, false, {\n        fileName: \"/home/project/src/lib/auth.js\",\n        lineNumber: 90,\n        columnNumber: 5\n    }, this);\n}\n//Hook passed directly above, refresh authentication and use it to perform an action\nfunction updateContext() {\n    const context = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(AuthContext);\n    if (context === undefined) {\n        throw new Error('updateContext must be used within an Authenticator');\n    }\n    return context;\n}\n//Helper for interacting with local authentication\nasync function fillContext(context) {\n    const { token } = (0,nookies__WEBPACK_IMPORTED_MODULE_3__.parseCookies)(context);\n    if (!token) {\n        return {\n            user: null\n        };\n    }\n    try {\n        // TODO: write token authentication microservice / private endpoint\n        // TODO: code a placeholder login success account name, password, admin:admin\n        const response = await fetch(`${process.env.API_URL}/api/token`, {\n            headers: {\n                Authorization: `Bearer ${token}`\n            }\n        });\n        const data = await response.json();\n        return {\n            user: data.user || null\n        };\n    } catch (error) {\n        console.error('Auth validation error:', error);\n        return {\n            user: null\n        };\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL3NyYy9saWIvYXV0aC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBdUU7QUFDL0I7QUFDeUI7QUFFakUsbUNBQW1DO0FBQ25DLE1BQU1RLDRCQUFjTixvREFBYUE7QUFFMUIsU0FBU08sY0FBYyxFQUFFQyxRQUFRLEVBQUVDLE9BQU8sRUFBRTtJQUNqRCxNQUFNLENBQUNDLE1BQU1DLFFBQVEsR0FBR2IsK0NBQVFBLENBQUM7SUFDakMsTUFBTWMsU0FBU1Ysc0RBQVNBO0lBRXhCLHdDQUF3QztJQUN4Q0gsZ0RBQVNBO21DQUFDO1lBQ1IsTUFBTSxFQUFFYyxLQUFLLEVBQUUsR0FBR1YscURBQVlBO1lBRTlCLElBQUlVLE9BQU87Z0JBQ1QsbUNBQW1DO2dCQUNuQ0MsTUFBTSxjQUFjO29CQUFFQyxTQUFTO3dCQUFFQyxlQUFlLENBQUMsT0FBTyxFQUFFSCxPQUFPO29CQUFDO2dCQUFFLEdBQ25FSSxJQUFJOytDQUFDQyxDQUFBQSxNQUFPQSxJQUFJQyxJQUFJOzhDQUNwQkYsSUFBSTsrQ0FBQ0csQ0FBQUE7d0JBQVUsSUFBSUEsS0FBS1YsSUFBSSxFQUFFOzRCQUFFQyxRQUFRUyxLQUFLVixJQUFJO3dCQUFHLE9BQ2hDOzRCQUFFQyxRQUFRO3dCQUFPO29CQUFDOzhDQUN0Q1UsS0FBSzsrQ0FBQzt3QkFBUVYsUUFBUTtvQkFBTTs7WUFDL0IsT0FBTztnQkFDTEEsUUFBUTtZQUNWO1FBQ0Y7a0NBQUcsRUFBRTtJQUVMLE9BQU87SUFDUCxNQUFNVyxRQUFRLE9BQU9DO1FBQ25CLElBQUk7WUFDRixNQUFNTCxNQUFNLE1BQU1KLE1BQU0sY0FBYztnQkFDcENVLFFBQVE7Z0JBQ1JULFNBQVM7b0JBQUUsZ0JBQWdCO2dCQUFtQjtnQkFDOUNVLE1BQU1DLEtBQUtDLFNBQVMsQ0FBQ0o7WUFDdkI7WUFFQSxJQUFJTCxJQUFJVSxFQUFFLEVBQUU7Z0JBQ1YsTUFBTVIsT0FBTyxNQUFNRixJQUFJQyxJQUFJO2dCQUUzQixtREFBbUQ7Z0JBQ25EZixrREFBU0EsQ0FBQyxNQUFNLFNBQVNnQixLQUFLUCxLQUFLLEVBQUU7b0JBQ25DZ0IsUUFBUSxJQUFJLEtBQUssS0FBSztvQkFDdEJDLE1BQU07Z0JBQ1I7Z0JBRUFuQixRQUFRUyxLQUFLVixJQUFJO2dCQUNqQixPQUFPO29CQUFFcUIsU0FBUztnQkFBSztZQUN6QixPQUFPO2dCQUNMLE1BQU1DLFFBQVEsTUFBTWQsSUFBSUMsSUFBSTtnQkFDNUIsT0FBTztvQkFBRWEsT0FBT0EsTUFBTUMsT0FBTyxJQUFJO2dCQUFlO1lBQ2xEO1FBQ0YsRUFBRSxPQUFPRCxPQUFPO1lBQ2RFLFFBQVFGLEtBQUssQ0FBQyxnQkFBZ0JBO1lBQzlCLE9BQU87Z0JBQUVBLE9BQU87WUFBK0I7UUFDakQ7SUFDRjtJQUVBLGlCQUFpQjtJQUNqQixNQUFNRyxTQUFTO1FBQ2IsSUFBSTtZQUNGLGlDQUFpQztZQUNqQzlCLHNEQUFhQSxDQUFDLE1BQU0sU0FBUztnQkFBRXlCLE1BQU07WUFBSTtZQUV6Qyx5QkFBeUI7WUFDekIsTUFBTWhCLE1BQU0sZUFBZTtnQkFDekJVLFFBQVE7WUFDVjtZQUVBYixRQUFRO1lBRVIsZUFBZTtZQUNwQixJQUFJQyxPQUFPd0IsUUFBUSxLQUFLLEtBQUs7Z0JBQ3RCeEIsT0FBT3lCLE9BQU8sQ0FBQztZQUNqQjtRQUNGLEVBQUUsT0FBT0wsT0FBTztZQUNkRSxRQUFRRixLQUFLLENBQUMsaUJBQWlCQTtRQUNqQztJQUNGO0lBRUEsdUNBQXVDO0lBQ3ZDLE1BQU1NLG1CQUFtQjtRQUN2QjVCO1FBQ0FZO1FBQ0FhO1FBQ0ExQjtJQUNGO0lBRUEsMENBQTBDO0lBQzFDLHFCQUNFLDhEQUFDSCxZQUFZaUMsUUFBUTtRQUFDQyxPQUFPRjtrQkFDMUI5Qjs7Ozs7O0FBR1A7QUFFQSxvRkFBb0Y7QUFDN0UsU0FBU2lDO0lBQ2QsTUFBTWhDLFVBQVVSLGlEQUFVQSxDQUFDSztJQUMzQixJQUFJRyxZQUFZaUMsV0FBVztRQUN6QixNQUFNLElBQUlDLE1BQU07SUFDbEI7SUFDQSxPQUFPbEM7QUFDVDtBQUVBLGtEQUFrRDtBQUMzQyxlQUFlbUMsWUFBWW5DLE9BQU87SUFDdkMsTUFBTSxFQUFFSSxLQUFLLEVBQUUsR0FBR1YscURBQVlBLENBQUNNO0lBRS9CLElBQUksQ0FBQ0ksT0FBTztRQUNWLE9BQU87WUFBRUgsTUFBTTtRQUFLO0lBQ3RCO0lBRUEsSUFBSTtRQUNGLG1FQUFtRTtRQUNuRSw2RUFBNkU7UUFDN0UsTUFBTW1DLFdBQVcsTUFBTS9CLE1BQU0sR0FBR2dDLFFBQVFDLEdBQUcsQ0FBQ0MsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQy9EakMsU0FBUztnQkFDUEMsZUFBZSxDQUFDLE9BQU8sRUFBRUgsT0FBTztZQUNsQztRQUNGO1FBRUEsTUFBTU8sT0FBTyxNQUFNeUIsU0FBUzFCLElBQUk7UUFFaEMsT0FBTztZQUFFVCxNQUFNVSxLQUFLVixJQUFJLElBQUk7UUFBSztJQUNuQyxFQUFFLE9BQU9zQixPQUFPO1FBQ2RFLFFBQVFGLEtBQUssQ0FBQywwQkFBMEJBO1FBQ3hDLE9BQU87WUFBRXRCLE1BQU07UUFBSztJQUN0QjtBQUNGIiwic291cmNlcyI6WyIvaG9tZS9wcm9qZWN0L3NyYy9saWIvYXV0aC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCBjcmVhdGVDb250ZXh0LCB1c2VDb250ZXh0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgdXNlUm91dGVyIH0gZnJvbSAnbmV4dC9yb3V0ZXInO1xuaW1wb3J0IHsgcGFyc2VDb29raWVzLCBzZXRDb29raWUsIGRlc3Ryb3lDb29raWUgfSBmcm9tICdub29raWVzJztcblxuLy9DcmVhdGUgY29udGV4dCBmb3IgYXV0aGVudGljYXRpb25cbmNvbnN0IEF1dGhDb250ZXh0ID0gY3JlYXRlQ29udGV4dCgpO1xuXG5leHBvcnQgZnVuY3Rpb24gQXV0aGVudGljYXRvcih7IGNoaWxkcmVuLCBjb250ZXh0IH0pIHtcbiAgY29uc3QgW3VzZXIsIHNldFVzZXJdID0gdXNlU3RhdGUobnVsbCk7XG4gIGNvbnN0IHJvdXRlciA9IHVzZVJvdXRlcigpO1xuXG4gIC8vQ2hlY2sgZm9yIGNsaWVudCBjb29raWUgYXV0aGVudGljYXRpb25cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCB7IHRva2VuIH0gPSBwYXJzZUNvb2tpZXMoKTtcbiAgICBcbiAgICBpZiAodG9rZW4pIHtcbiAgICAgIC8vQ2xpZW50IHNpZGUgdXBkYXRlIGF1dGhlbnRpY2F0aW9uXG4gICAgICBmZXRjaCgnL2FwaS90b2tlbicsIHsgaGVhZGVyczogeyBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7dG9rZW59YCB9IH0pXG4gICAgICAudGhlbihyZXMgPT4gcmVzLmpzb24oKSlcbiAgICAgIC50aGVuKGRhdGEgPT4geyBpZiAoZGF0YS51c2VyKSB7IHNldFVzZXIoZGF0YS51c2VyKTsgfVxuICAgICAgICAgICAgICAgICAgICAgIGVsc2UgeyBzZXRVc2VyKG51bGwpOyB9fSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7IHNldFVzZXIobnVsbCkgfSk7XG4gICAgfSBlbHNlIHsgXG4gICAgICBzZXRVc2VyKG51bGwpOyBcbiAgICB9IFxuICB9LCBbXSk7XG5cbiAgLy9Mb2dpblxuICBjb25zdCBsb2dpbiA9IGFzeW5jIChjcmVkZW50aWFscykgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCgnL2FwaS9sb2dpbicsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShjcmVkZW50aWFscylcbiAgICAgIH0pO1xuXG4gICAgICBpZiAocmVzLm9rKSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXMuanNvbigpO1xuICAgICAgICBcbiAgICAgICAgLy9TZXQgYXV0aGVudGljYXRpb24gZm9yIDE0IGRheXMsIG9yIGVuZCBvZiBzZXNzaW9uXG4gICAgICAgIHNldENvb2tpZShudWxsLCAndG9rZW4nLCBkYXRhLnRva2VuLCB7XG4gICAgICAgICAgbWF4QWdlOiA3ICogMjQgKiA2MCAqIDYwLCAvLyAxNCBkYXlzLCBvciBlbmQgb2Ygc2Vzc2lvblxuICAgICAgICAgIHBhdGg6ICcvJyxcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBzZXRVc2VyKGRhdGEudXNlcik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGVycm9yID0gYXdhaXQgcmVzLmpzb24oKTtcbiAgICAgICAgcmV0dXJuIHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ0xvZ2luIGZhaWxlZCcgfTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignTG9naW4gZXJyb3I6JywgZXJyb3IpO1xuICAgICAgcmV0dXJuIHsgZXJyb3I6ICdBbiB1bmV4cGVjdGVkIGVycm9yIG9jY3VycmVkJyB9O1xuICAgIH1cbiAgfTtcblxuICAvL0xvZ291dCBmdW5jdGlvblxuICBjb25zdCBsb2dvdXQgPSBhc3luYyAoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIC8vRGVsZXRlIGN1cnJlbnQgc2Vzc2lvbidzIGNvb2tpZVxuICAgICAgZGVzdHJveUNvb2tpZShudWxsLCAndG9rZW4nLCB7IHBhdGg6ICcvJyB9KTtcbiAgICAgIFxuICAgICAgLy9Ob3RpZnkgc2VydmVyIG9mIGxvZ291dFxuICAgICAgYXdhaXQgZmV0Y2goJy9hcGkvbG9nb3V0Jywge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJ1xuICAgICAgfSk7XG4gICAgICBcbiAgICAgIHNldFVzZXIobnVsbCk7XG4gICAgICBcbiAgICAgIC8vUm91dGUgdG8gSG9tZVxuXHRpZiAocm91dGVyLnBhdGhuYW1lICE9PSAnLycpIHtcbiAgICAgICAgcm91dGVyLnJlcGxhY2UoJy8nKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignTG9nb3V0IGVycm9yOicsIGVycm9yKTtcbiAgICB9XG4gIH07XG5cbiAgLy9BcHBsaWNhdGlvbiBjb250ZXh0IGlzIHVzZXIgZGVwZW5kZW50XG4gIGNvbnN0IGF1dGhDb250ZXh0VmFsdWUgPSB7XG4gICAgdXNlcixcbiAgICBsb2dpbixcbiAgICBsb2dvdXQsXG4gICAgY29udGV4dFxuICB9O1xuXG4gIC8vQXV0aG9yaXplIGFuZCByZXR1cm4gdGhlIHVwZGF0ZWQgY29udGV4dFxuICByZXR1cm4gKFxuICAgIDxBdXRoQ29udGV4dC5Qcm92aWRlciB2YWx1ZT17YXV0aENvbnRleHRWYWx1ZX0+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9BdXRoQ29udGV4dC5Qcm92aWRlcj5cbiAgKTtcbn1cblxuLy9Ib29rIHBhc3NlZCBkaXJlY3RseSBhYm92ZSwgcmVmcmVzaCBhdXRoZW50aWNhdGlvbiBhbmQgdXNlIGl0IHRvIHBlcmZvcm0gYW4gYWN0aW9uXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlQ29udGV4dCgpIHtcbiAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoQXV0aENvbnRleHQpO1xuICBpZiAoY29udGV4dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1cGRhdGVDb250ZXh0IG11c3QgYmUgdXNlZCB3aXRoaW4gYW4gQXV0aGVudGljYXRvcicpO1xuICB9XG4gIHJldHVybiBjb250ZXh0O1xufVxuXG4vL0hlbHBlciBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBsb2NhbCBhdXRoZW50aWNhdGlvblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZpbGxDb250ZXh0KGNvbnRleHQpIHtcbiAgY29uc3QgeyB0b2tlbiB9ID0gcGFyc2VDb29raWVzKGNvbnRleHQpO1xuICBcbiAgaWYgKCF0b2tlbikge1xuICAgIHJldHVybiB7IHVzZXI6IG51bGwgfTtcbiAgfVxuICBcbiAgdHJ5IHtcbiAgICAvLyBUT0RPOiB3cml0ZSB0b2tlbiBhdXRoZW50aWNhdGlvbiBtaWNyb3NlcnZpY2UgLyBwcml2YXRlIGVuZHBvaW50XG4gICAgLy8gVE9ETzogY29kZSBhIHBsYWNlaG9sZGVyIGxvZ2luIHN1Y2Nlc3MgYWNjb3VudCBuYW1lLCBwYXNzd29yZCwgYWRtaW46YWRtaW5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke3Byb2Nlc3MuZW52LkFQSV9VUkx9L2FwaS90b2tlbmAsIHtcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke3Rva2VufWBcbiAgICAgIH1cbiAgICB9KTtcbiAgICBcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgIFxuICAgIHJldHVybiB7IHVzZXI6IGRhdGEudXNlciB8fCBudWxsIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignQXV0aCB2YWxpZGF0aW9uIGVycm9yOicsIGVycm9yKTtcbiAgICByZXR1cm4geyB1c2VyOiBudWxsIH07XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJ1c2VTdGF0ZSIsInVzZUVmZmVjdCIsImNyZWF0ZUNvbnRleHQiLCJ1c2VDb250ZXh0IiwidXNlUm91dGVyIiwicGFyc2VDb29raWVzIiwic2V0Q29va2llIiwiZGVzdHJveUNvb2tpZSIsIkF1dGhDb250ZXh0IiwiQXV0aGVudGljYXRvciIsImNoaWxkcmVuIiwiY29udGV4dCIsInVzZXIiLCJzZXRVc2VyIiwicm91dGVyIiwidG9rZW4iLCJmZXRjaCIsImhlYWRlcnMiLCJBdXRob3JpemF0aW9uIiwidGhlbiIsInJlcyIsImpzb24iLCJkYXRhIiwiY2F0Y2giLCJsb2dpbiIsImNyZWRlbnRpYWxzIiwibWV0aG9kIiwiYm9keSIsIkpTT04iLCJzdHJpbmdpZnkiLCJvayIsIm1heEFnZSIsInBhdGgiLCJzdWNjZXNzIiwiZXJyb3IiLCJtZXNzYWdlIiwiY29uc29sZSIsImxvZ291dCIsInBhdGhuYW1lIiwicmVwbGFjZSIsImF1dGhDb250ZXh0VmFsdWUiLCJQcm92aWRlciIsInZhbHVlIiwidXBkYXRlQ29udGV4dCIsInVuZGVmaW5lZCIsIkVycm9yIiwiZmlsbENvbnRleHQiLCJyZXNwb25zZSIsInByb2Nlc3MiLCJlbnYiLCJBUElfVVJMIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(pages-dir-node)/./src/lib/auth.js\n");

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

/***/ "nookies":
/*!**************************!*\
  !*** external "nookies" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("nookies");

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