export type Page<T> = PageRequest & {
    // total elements over all pages
    totalElements: number
    // total number of pages
    totalPages: number
    // is the page empty?
    empty: boolean
    // is this the first page?
    first: boolean
    // is this the last page?
    last: boolean
    content: T[]
}

export type PageRequest = {
    // the size of the page
    size: number
    // the page number
    number: number
}

export type Ref = {
    source: string
    id: string
}

export enum Vote {
    NONE = "NONE",
    UP = "UP",
    DOWN = "DOWN"
}

export type MediaRating = {
    id: number
    vote: Vote
    favourite: boolean
}

export type MediaTag = {
    id: number
    tag: string
    confidence: number
}

export type Media = {
    id: number
    creationTime: Date
    crawlTime: Date
    tagTime: Date
    promoted: boolean
    ref: Ref
    contentPath: string
    thumbnailPath: string
    downloaded: boolean
    tagged: boolean
    tags: MediaTag[]
    rating?: MediaRating
    deleted: boolean
    markedForDeletion: boolean
}

// // TODO MVR remove?!
// export type MediaEntity = {
//     crawled: Date
//     created: Date
//     downloaded: true
//     favourite: true
//     id: number
//     image: string,
//     thumbnail: string,
//     user: string,
//     userId: number
//     ref: Ref
//     tags: MediaTag[]
//     rating?: MediaRating
// }

export class Cache<T> {
    private pages: { [key: number]: Page<T> } = {};

    public constructor(private id: string) {

    }

    public addPage(page: Page<T>) {
        if (this.isCached(page)) {
            throw new Error("Page already cached");
        }
        this.pages[page.number] = page;
        console.log("page added", this)
    }

    public clear(id: string) {
        this.pages = {};
        this.id = id;
    }

    public isCached(page: PageRequest): boolean {
        return Object.keys(this.pages).indexOf(`${page.number}`) >= 0;
    }

    public getPage(page: PageRequest): Page<T> {
        if (this.isCached(page)) {
            return this.pages[page.number];
        }
        throw new Error("page not cached. Bailing");
    }

    matchesId(id: string): boolean {
        return id == this.id;
    }
}