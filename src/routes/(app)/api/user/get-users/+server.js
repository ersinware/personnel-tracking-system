import {json} from "@sveltejs/kit";
import {PAGE_SIZE_USERS} from "$lib/js/common/constants.common.js";
import {getUsers} from "$lib/js/server/repositories/repository.sqlite.users.server.js";

export async function GET({locals}) {
    const params = new URLSearchParams(locals.search),
        page = Number(params.get('sayfa')) || 1,
        limitStart = PAGE_SIZE_USERS * (page - 1),
        limitEnd = PAGE_SIZE_USERS * page

    if (locals.user.role === 0) {
        const {error, users} = await getUsers(
            locals.user.id,
            undefined,
            '1, 2',
            params.get('kullanıcı-adı'),
            params.get('birim-adı'),
            limitStart,
            limitEnd
        )

        if (error)
            return json({error}, {status: 404})

        return json({users, noMore: users.length < limitEnd - limitStart})
    }

    const {error, users} = await getUsers(
        locals.user.id,
        locals.user.authorizedUnit.id,
        '2',
        params.get('kullanıcı-adı'),
        undefined,
        limitStart,
        limitEnd
    )

    if (error)
        return json({error}, {status: 404})

    return json({users, noMore: users.length < limitEnd - limitStart})
}