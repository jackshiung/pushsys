import { Router } from "express";
import managementRouter from "./management";
import loginRouter from "./login";
import { config } from "../configuration";


const router = Router();

router.use('/', loginRouter)
router.use('/management', managementRouter)

router.get('/share', async (req, res, next) => {
  if (req.query['liff.state']) {
    const subpath = req.query['liff.state'] as string
    res.redirect(`/share${decodeURIComponent(subpath)}`)
    return
  } else if (req.query['code']) {
    res.render('index', { title: config.appTitle })
    return
  }
  next()
})
router.get('/share/:code', async (req, res) => {
  res.render('index', { title: config.appTitle })
})

export default router;