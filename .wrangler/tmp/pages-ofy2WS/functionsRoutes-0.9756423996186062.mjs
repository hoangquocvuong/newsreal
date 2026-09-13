import { onRequest as __api___path___js_onRequest } from "C:\\Users\\HOANG VUONG\\OneDrive\\Desktop\\newsreal\\functions\\api\\[[path]].js"
import { onRequest as ____path___js_onRequest } from "C:\\Users\\HOANG VUONG\\OneDrive\\Desktop\\newsreal\\functions\\[[path]].js"

export const routes = [
    {
      routePath: "/api/:path*",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api___path___js_onRequest],
    },
  {
      routePath: "/:path*",
      mountPath: "/",
      method: "",
      middlewares: [],
      modules: [____path___js_onRequest],
    },
  ]