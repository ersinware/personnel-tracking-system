import {convertFromSQLiteDate, convertToSQLiteDate, db} from "$lib/js/server/sqlite.server.js"

export function createWorksTable() {
    return new Promise((resolve) => {
            db.run(
                `
                    CREATE TABLE IF NOT EXISTS works(
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        userId INTEGER NOT NULL,
                        unitId INTEGER NOT NULL,
                        date DATETIME NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M', 'now', 'localtime')),
                        content TEXT NOT NULL,
                        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
                        FOREIGN KEY (unitId) REFERENCES units(id) ON DELETE CASCADE
                    )
                `,
                (error) => {
                    if (error)
                        resolve(error.message)
                    else
                        db.run(
                            "CREATE INDEX IF NOT EXISTS idx_works_date ON works (date)",
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
    )
}

export function createWork(userId, unitId, content) {
    return new Promise((resolve) => {
            db.run(
                `
                    INSERT INTO works (userId, unitId, content) 
                    VALUES (?, ?, ?)
                `,
                [userId, unitId, content],
                async function (error) {
                    if (error)
                        resolve(error.message)
                    else
                        resolve()
                }
            )
        }
    )
}

export function editWork(id, content) {
    return new Promise((resolve) => {
            db.run(
                `
                    UPDATE works SET content = ? 
                    WHERE id = ?
                `,
                [content, id],
                async function (error) {
                    if (error)
                        resolve(error.message)
                    else if (this.changes === 0)
                        resolve('Çalışma bulunamadı.')
                    else {
                        resolve()
                    }
                }
            )
        }
    )
}

export function removeWork(id) {
    return new Promise((resolve) => {
            db.run(
                `
                    DELETE FROM works 
                    WHERE id = ?
                `,
                [id],
                function (error) {
                    if (error)
                        resolve(error.message)
                    else if (this.changes === 0)
                        resolve('Çalışma bulunamadı.')
                    else
                        resolve()
                }
            )
        }
    )
}

export function getWork(id) {
    return new Promise((resolve) => {
            db.get(
                `
                    SELECT works.id, works.date, works.content, users.fullName AS userFullName, units.name AS unitName
                    FROM works
                    JOIN users ON works.userId = users.id
                    JOIN units ON works.unitId = units.id
                    WHERE works.id = ?
                `,
                [id],
                (error, row) => {
                    if (error)
                        resolve({error: error.message})
                    else if (!row)
                        resolve({error: "Çalışma Bulunamadı."})
                    else
                        resolve({
                                work: {
                                    id: row.id,
                                    date: row.date,
                                    content: row.content,
                                    user: {fullName: row.userFullName},
                                    unit: {name: row.unitName}
                                }
                            }
                        )
                }
            )
        }
    )
}

export function getWorks(userId, notUserId, unitId, searchUserFullName, searchUnitName, date, limitStart, limitEnd) {
    return new Promise((resolve) => {
            const params = []
            let query = `
                    SELECT works.id, works.date, works.content, users.fullName AS userFullName, users.role AS userRole, units.name AS unitName
                    FROM works
                    JOIN users ON works.userId = users.id
                    JOIN units ON works.unitId = units.id
                    WHERE 1=1
                `

            if (userId) {
                query += ` AND works.userId = ?`
                params.push(userId)
            } else {
                if (notUserId) {
                    query += ` AND works.userId != ?`
                    params.push(notUserId)
                }

                if (unitId) {
                    query += ` AND works.unitId = ?`
                    params.push(unitId)
                } else if (searchUnitName) {
                    query += ` AND units.name LIKE ?`
                    params.push(`%${searchUnitName}%`)
                }

                if (searchUserFullName) {
                    query += ` AND users.fullName LIKE ?`
                    params.push(`%${searchUserFullName}%`)
                }
            }

            if (date) {
                const _date = convertToSQLiteDate(date)
                if (_date) {
                    query += ` AND date(works.date) = date(?)`
                    params.push(_date)
                }
            }

            query += " ORDER BY works.date DESC"

            if (limitStart && limitEnd) {
                query += ` LIMIT ? OFFSET ?`
                params.push(limitEnd - limitStart, limitStart)
            } else if (limitEnd) {
                query += ` LIMIT ?`
                params.push(limitEnd)
            }

            db.all(
                query,
                params,
                (error, rows) => {
                    if (error)
                        resolve({error: error.message})
                    else
                        resolve({
                                works: rows.map(work => ({
                                        id: work.id,
                                        date: convertFromSQLiteDate(work.date),
                                        content: work.content,
                                        user: {name: work.userFullName, role: work.userRole},
                                        unit: {name: work.unitName}
                                    })
                                )
                            }
                        )
                }
            )
        }
    )
}
