import {initSQLite} from "$lib/js/server/sqlite.server.js";
import {minify} from "html-minifier";
import {createUsersTable} from "$lib/js/server/repositories/repository.sqlite.users.server.js";
import {createUnitsTable} from "$lib/js/server/repositories/repository.sqlite.units.server.js";
import {createWorksTable} from "$lib/js/server/repositories/repository.sqlite.works.server.js";
import {
    createAuthenticatedUsersTable,
    isAuthenticated
} from "$lib/js/server/repositories/repository.sqlite.authenticated.users.server.js";
import {
    createRecoverPasswordTokensTable
} from "$lib/js/server/repositories/repository.sqlite.recover.password.tokens.server.js";
import {initMail} from "$lib/js/server/util.mail.server.js";
import {json, redirect} from "@sveltejs/kit";
import {
    ROUTES_ADMINS,
    ROUTES_MASTER_ADMINS,
    ROUTES_SHOULD_NOT_BE_AUTHENTICATED
} from "$lib/js/server/constants.server.js";

await initSQLite()

const error = await createUsersTable()
if (error)
    console.error('\n' + error)

const _error = await createAuthenticatedUsersTable()
if (_error)
    console.error('\n' + _error)

const __error = await createRecoverPasswordTokensTable()
if (__error)
    console.error('\n' + __error)

const ___error = await createUnitsTable()
if (___error)
    console.error('\n' + ___error)

const ____error = await createWorksTable()
if (____error)
    console.error('\n' + ____error)

initMail()

export async function handle({event, resolve}) {
    const result = await handleAuth(event)
    if (result)
        return result

    event.locals.search = decodeURI(event.url.search)

    let page = ''
    return await resolve(
        event,
        {
            transformPageChunk: ({html, done}) => {
                page += html

                if (done)
                    return minify(
                        page,
                        {
                            collapseBooleanAttributes: true,
                            collapseWhitespace: true,
                            conservativeCollapse: true,
                            decodeEntities: true,
                            html5: true,
                            ignoreCustomComments: [/^#/],
                            minifyCSS: true,
                            minifyJS: true,
                            removeAttributeQuotes: true,
                            removeComments: false, // some hydration code needs comments, so leave them in
                            removeOptionalTags: true,
                            removeRedundantAttributes: true,
                            removeScriptTypeAttributes: true,
                            removeStyleLinkTypeAttributes: true,
                            sortAttributes: true,
                            sortClassName: true,
                        }
                    )
            }
        }
    )
}

    async function handleAuth(event) {
        const pathname = decodeURI(event.url.pathname),
            sessionId = event.cookies.get('sessionId')

        if (ROUTES_SHOULD_NOT_BE_AUTHENTICATED.has(pathname)) {
            if (!sessionId) {
                event.locals.user = {authenticated: false}

                return
            }

            const {authenticated} = await isAuthenticated(sessionId)
            if (authenticated) {
                if (event.isDataRequest)
                    return json({error: 'Oturumunuz açıkken bu servisi kullanamazsınız.'}, {status: 401})

                throw redirect(307, encodeURI("/?oturum-açık"))
            }

            event.cookies.set("sessionId", '', {path: '/', maxAge: -1})

            return
        }

        if (!sessionId)
            throw redirect(307, encodeURI("/giriş-yap?yetkisiz"))

        const {error, authenticated, userId, role, authorizedUnit} = await isAuthenticated(sessionId)
        if (error || !authenticated) {
            if (event.isDataRequest)
                return json({error: 'Bu servisi kullanmak için yetkiniz yok.'}, {status: 401})

            throw redirect(307, encodeURI("/giriş-yap?yetkisiz"))
        }

        if (ROUTES_MASTER_ADMINS.has(pathname) && role !== 0) {
            if (event.isDataRequest)
                return json({error: 'Bu servisi kullanmak için yetkiniz yok.'}, {status: 401})

            throw redirect(307, encodeURI("/?yetkisiz"))
        }

        if (ROUTES_ADMINS.has(pathname) && role !== 0 && role !== 1) {
            if (event.isDataRequest)
                return json({error: 'Bu servisi kullanmak için yetkiniz yok.'}, {status: 401})

            throw redirect(307, encodeURI("/?yetkisiz"))
        }

        event.locals.user = {authenticated: true, id: userId, role, authorizedUnit}
    }