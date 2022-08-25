import { Router } from "express";
import { config } from "../../configuration";

const router = Router();

router.get('/', (req, res) => {

    if (req.cookies['user-token']) {
        res.redirect('/management');
        return;
    }

    res.redirect('/login');
})

router.get('/login', (req, res) => {

    if (req.cookies['user-token']) {
        res.redirect('/management');
        return;
    }

    res.render('management/index', { title: config.appTitle })
})

router.get('/logout', async (req, res) => {
    res.clearCookie('user-token');
    res.redirect('/login');
})

export default router;