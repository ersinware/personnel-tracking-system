import {db} from "$lib/js/server/sqlite.server.js"

export function createUnitsTable() {
    return new Promise((resolve) => {
            db.run(
                `
                    CREATE TABLE IF NOT EXISTS units (
                        id INTEGER PRIMARY KEY AUTOINCREMENT, 
                        name TEXT NOT NULL UNIQUE
                    )
                `,
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

export function createUnit(name) {
    return new Promise((resolve) => {
            db.run(
                `
                    INSERT INTO units (name) 
                    VALUES (?)
                `,
                [name],
                function (error) {
                    if (error)
                        resolve({error: error.message})
                    else
                        resolve({unit: {id: this.lastID, name}})
                }
            )
        }
    )
}

export function editUnitName(id, name) {
    return new Promise((resolve) => {
            db.run(
                `
                    UPDATE units SET name = ? 
                    WHERE id = ?
                `,
                [name, id],
                function (error) {
                    if (error)
                        resolve(error.message)
                    else if (this.changes === 0)
                        resolve('Birim bulunamadı.')
                    else
                        resolve()
                }
            )
        }
    )
}

export function removeUnit(id) {
    return new Promise((resolve) => {
            db.run(
                `
                    DELETE FROM units 
                    WHERE id = ?
                `,
                [id],
                function (error) {
                    if (error)
                        resolve(error.message)
                    else if (this.changes === 0)
                        resolve('Birim bulunamadı.')
                    else
                        resolve()
                }
            )
        }
    )
}

export function getUnits(search, limitStart, limitEnd) {
    return new Promise((resolve) => {
            const params = []
            let query = `
                    SELECT units.*, COUNT(works.id) AS countNumber
                    FROM units
                    LEFT JOIN works ON units.id = works.unitId
                `

            if (search) {
                query += ` WHERE name LIKE ?`
                params.push(`%${search}%`)
            }

            query += ` GROUP BY units.id ORDER BY units.id DESC`

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
                        resolve({units: rows})
                }
            )
        }
    )
}
