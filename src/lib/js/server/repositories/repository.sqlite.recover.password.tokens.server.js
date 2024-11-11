import {db} from "$lib/js/server/sqlite.server.js";

export function createRecoverPasswordTokensTable() {
    return new Promise((resolve) => {
            db.run(
                `
                    CREATE TABLE IF NOT EXISTS recoverPasswordTokens (
                        token TEXT PRIMARY KEY, 
                        userId INTEGER NOT NULL
                    )
                `,
                (error) => {
                    if (error)
                        resolve(error.message)
                    else
                        resolve()
                })
        }
    )
}

export function createToken(token, userId) {
    return new Promise((resolve) => {
            db.run(
                `
                    INSERT INTO recoverPasswordTokens (token, userId) 
                    VALUES (?, ?)
                `,
                [token, userId],
                (error) => {
                    if (error)
                        resolve(error.message)
                    else
                        resolve()
                }
            )
        }
    )
}

export function removeToken(token) {
    return new Promise((resolve) => {
            db.run(
                `
                    DELETE FROM recoverPasswordTokens 
                    WHERE token = ?
                `,
                [token],
                function (error) {
                    if (error)
                        resolve(error.message)
                    else if (this.changes === 0)
                        resolve('Bilet bulunamadı.')
                    else
                        resolve()
                }
            )
        }
    )
}

export function getUserIdByToken(token) {
    return new Promise((resolve) => {
            db.get(
                `
                    SELECT userId FROM recoverPasswordTokens 
                    WHERE token = ?
                `,
                [token],
                (error, row) => {
                    if (error)
                        resolve({error: error.message})
                    else if (!row)
                        resolve({error: 'Bilet bulunamadı.'})
                    else
                        resolve({userId: row.userId})
                }
            )
        }
    )
}

export function checkTokenExistence(token) {
    return new Promise((resolve) => {
            db.get(
                `
                    SELECT 1 FROM recoverPasswordTokens 
                    WHERE token = ? 
                    LIMIT 1
                `,
                [token],
                (error, row) => {
                    if (error)
                        resolve({error: error.message})
                    else if (!row)
                        resolve({exists: false})
                    else
                        resolve({exists: true})
                }
            )
        }
    )
}

