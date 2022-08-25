import { typeChecker } from 'camel-toolbox';
import { Router } from "express";
import { config } from '../../configuration';

const router = Router();

router.get('/*', (req, res) => {

    if (typeChecker.isNullOrUndefinedObject(req.cookies)) {
        res.redirect('/login');
        return;
    }

    const token = req.cookies['user-token'];

    if (typeChecker.isNullOrUndefinedOrWhiteSpace(token)) {
        res.redirect('/login');
        return;
    }

    res.render('management/index', { title: config.appTitle })
})



export default router;