import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { blogsList } from 'src/demo-data/blogs';
import { thumbnailList } from 'src/demo-data/image_data';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostService {
   constructor(private prisma: PrismaService) { }

   async profilePosts(userId: number, queryParameter: {
      page?: number;
      limit?: number;
      search?: string;
      sortColumn?: string;
      sortOrder?: 'asc' | 'desc';
      type?: string;
      status?: string;
   }) {
      try {

         const {
            page = 1,
            limit = 25,
            search = '',
            sortColumn = 'createdAt',
            sortOrder = 'desc',
            type = 'post',
            status = 'all',
         } = queryParameter;


         const conditions: any = {
            type,
            authorId: userId,
         };

         if (search) {
            conditions.OR = [
               { name: { contains: search, mode: 'insensitive' } },
               { slug: { contains: search, mode: 'insensitive' } },
            ];
         }

         if (status !== 'all') {
            conditions.status = status;
         }

         const query: any = {};
         if (sortColumn && sortOrder) {
            query.orderBy = { [sortColumn]: sortOrder };
         }

         // Fetch posts with pagination, sorting, and relations
         const posts = await this.prisma.posts.findMany({
            where: conditions,
            take: +limit,
            skip: (+page - 1) * +limit,
            ...query,
            include: {
               author: {
                  select: {
                     id: true,
                     name: true,
                     display_name: true,
                     username: true,
                  },
               },
               categories: {
                  select: {
                     taxonomy: {
                        select: {
                           id: true,
                           name: true,
                           slug: true,
                        },
                     },
                  },
               },
            },
         });

         // Count total posts for pagination
         const count = await this.prisma.posts.count({
            where: conditions,
         });

         return { posts, count };
      } catch (error) {
         throw new HttpException(
            {
               status: HttpStatus.INTERNAL_SERVER_ERROR,
               success: false,
               message: 'Failed to fetch posts',
               error: error.message,
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
         );
      }
   }

   async updateDraftPost(body: any) {
      const { id, slug, authorId, categories = [], ...rest } = body

      const checkSlug = await this.prisma.posts.findUnique({
         where: {
            slug: slug,
            NOT: { id: +id }
         }
      })
      if (checkSlug) {
         throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'Slug already exist' }, HttpStatus.CONFLICT)
      }

      const postTaxonomies = await this.prisma.postTaxonomy.findMany({
         where: {
            postId: +id,
            taxonomy: {
               type: 'category',
            },
         }
      });
      const previousCategory = postTaxonomies?.map(item => item.taxonomyId) || [];
      const updatedCategories = categories?.filter(id => !previousCategory.includes(id)) || [];
      const removedCategories = previousCategory.filter(id => !categories?.includes(id)) || [];

      await Promise.all([
         updatedCategories.length > 0 &&
         this.prisma.postTaxonomy.createMany({
            data: updatedCategories.map((taxonomyId: number) => ({
               postId: +id,
               taxonomyId,
            })),
         }),
         removedCategories.length > 0 &&
         this.prisma.postTaxonomy.deleteMany({
            where: {
               postId: +id,
               taxonomyId: { in: removedCategories },
            },
         }),
      ]);

      const updatePost = await this.prisma.posts.update({
         where: { id: +id },
         data: {
            slug,
            ...rest,
            authorId: +authorId
         }
      });

      if (!updatePost) {
         throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, success: false, message: 'Failed to update post' }, HttpStatus.INTERNAL_SERVER_ERROR)
      }
      return updatePost
   }

   async publishPost(body: any) {
      const { id, slug, status = 'pending', authorId, categories = [], ...rest } = body

      const checkSlug = await this.prisma.posts.findUnique({
         where: {
            slug: slug,
            NOT: { id: +id }
         }
      })
      if (checkSlug) {
         throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'Slug already exist' }, HttpStatus.CONFLICT)
      }

      const postTaxonomies = await this.prisma.postTaxonomy.findMany({
         where: {
            postId: +id,
            taxonomy: {
               type: 'category',
            },
         }
      });
      const previousCategory = postTaxonomies?.map(item => item.taxonomyId) || [];
      const updatedCategories = categories?.filter(id => !previousCategory.includes(id)) || [];
      const removedCategories = previousCategory.filter(id => !categories?.includes(id)) || [];

      await Promise.all([
         updatedCategories.length > 0 &&
         this.prisma.postTaxonomy.createMany({
            data: updatedCategories.map((taxonomyId: number) => ({
               postId: +id,
               taxonomyId,
            })),
         }),
         removedCategories.length > 0 &&
         this.prisma.postTaxonomy.deleteMany({
            where: {
               postId: +id,
               taxonomyId: { in: removedCategories },
            },
         }),
      ]);

      const updatePost = await this.prisma.posts.update({
         where: { id: +id },
         data: {
            slug,
            status,
            ...rest,
            authorId: +authorId
         }
      });

      if (!updatePost) {
         throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, success: false, message: 'Failed to update post' }, HttpStatus.INTERNAL_SERVER_ERROR)
      }
      return updatePost
   }
   async createAndPublishPost(body: any) {
      const { id, title, slug, status = 'pending', authorId, categories = [], ...rest } = body

      const createSlug = slug || title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

      const checkSlug = await this.prisma.posts.findUnique({
         where: {
            slug: createSlug
         }
      })
      if (checkSlug) {
         throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'Slug already exist' }, HttpStatus.CONFLICT)
      }

      const newPost = await this.prisma.posts.create({
         data: {
            title,
            slug: createSlug,
            status,
            authorId: +authorId,
            ...rest,
            categories: {
               create: categories?.map((id: number) => ({
                  taxonomy: { connect: { id: id } },
               })),
            }
         }
      })

      if (!newPost) {
         throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, success: false, message: 'Failed to update post' }, HttpStatus.INTERNAL_SERVER_ERROR)
      }
      return newPost
   }

   async publicPost(slug: string) {
      try {
         const post = await this.prisma.posts.findUnique({
            where: {
               slug: slug,
               status: 'published'
            },
            include: {
               author: {
                  select: {
                     id: true,
                     name: true,
                     display_name: true,
                     username: true,
                     bio: true,
                     social_media: true
                  }
               },
               categories: {
                  select: {
                     taxonomy: {
                        select: {
                           id: true,
                           name: true,
                           slug: true,
                        }
                     },
                  }
               }
            }
         })
         return post;
      } catch (error) {
         throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, success: false, message: 'Post Not Found', error }, HttpStatus.INTERNAL_SERVER_ERROR)
      }
   }

   async publicPostMeta(slug: string) {
      try {
         const post = await this.prisma.posts.findUnique({
            where: {
               slug: slug,
               status: 'published'
            },
            select: {
               thumbnail: true,
               title: true,
               slug: true,
               meta_title: true,
               meta_description: true
            }
         })

         return post;
      } catch (error) {
         throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, success: false, message: 'Post Not Found', error }, HttpStatus.INTERNAL_SERVER_ERROR)
      }
   }

   async publicPosts(queryParameter: { [key: string]: string }) {
      try {
         const { page = 1, limit = 25, search = '', sortColumn = 'createdAt', sortOrder = 'desc', post_type = "post", category = 'all' } = queryParameter
         const conditions: any = {}
         if (search) {
            conditions.OR = [
               { name: { contains: search, mode: "insensitive" } },
               { slug: { contains: search, mode: "insensitive" } },
            ]
         }
         if (category !== 'all') {
            conditions.categories = {
               some: {
                  taxonomyId: parseInt(category)
               }
            }
         }
         conditions.type = post_type
         conditions.status = 'published'

         const query: any = {}
         if (sortColumn && sortOrder) {
            query.orderBy = { [sortColumn]: sortOrder }
         }
         const posts = await this.prisma.posts.findMany({
            where: conditions,
            take: +limit,
            skip: (+page - 1) * +limit,
            ...query,
            include: {
               author: {
                  select: {
                     id: true,
                     name: true,
                     display_name: true,
                     username: true,
                  }
               },
               categories: {
                  select: {
                     taxonomy: {
                        select: {
                           id: true,
                           name: true,
                           slug: true,
                        }
                     },
                  }
               },
            },
         });

         const count = await this.prisma.posts.count({
            where: conditions,
         });

         return { posts, count };
      } catch (error) {
         throw error
      }
   }

   async authorPosts(authorId: string, queryParameter: { [key: string]: string }) {
      try {
         const { page = 1, limit = 25, search = '', sortColumn = 'createdAt', sortOrder = 'desc', post_type = "post", category = 'all' } = queryParameter
         const conditions: any = {}
         if (search) {
            conditions.OR = [
               { name: { contains: search, mode: "insensitive" } },
               { slug: { contains: search, mode: "insensitive" } },
            ]
         }
         if (category !== 'all') {
            conditions.categories = {
               some: {
                  taxonomyId: parseInt(category)
               }
            }
         }
         conditions.type = post_type
         conditions.status = 'published'
         conditions.authorId = parseInt(authorId)

         const query: any = {}
         if (sortColumn && sortOrder) {
            query.orderBy = { [sortColumn]: sortOrder }
         }
         const posts = await this.prisma.posts.findMany({
            where: conditions,
            take: +limit,
            skip: (+page - 1) * +limit,
            ...query,
            include: {
               categories: {
                  select: {
                     taxonomy: {
                        select: {
                           id: true,
                           name: true,
                           slug: true,
                        }
                     },
                  }
               },
            },
         });

         const count = await this.prisma.posts.count({
            where: conditions,
         });

         return { posts, count };
      } catch (error) {
         throw error
      }
   }

   async taxonomyPosts(userId: number, taxonomyId: string, queryParameter: { [key: string]: string }) {
      try {
         const { page = 1, limit = 25, search = '', sortColumn = 'createdAt', sortOrder = 'desc', post_type = "post" } = queryParameter
         const conditions: any = {}
         if (search) {
            conditions.OR = [
               { name: { contains: search, mode: "insensitive" } },
               { slug: { contains: search, mode: "insensitive" } },
            ]
         }
         conditions.categories = {
            some: {
               taxonomyId: parseInt(taxonomyId)
            }
         }
         conditions.type = post_type
         conditions.status = 'published'

         const query: any = {}
         if (sortColumn && sortOrder) {
            query.orderBy = { [sortColumn]: sortOrder }
         }
         const posts = await this.prisma.posts.findMany({
            where: conditions,
            take: +limit,
            skip: (+page - 1) * +limit,
            ...query,
            include: {
               author: {
                  select: {
                     id: true,
                     name: true,
                     display_name: true,
                     username: true,
                  },
               },
               ...(userId !== null && {
                  savedPosts: {
                     where: {
                        userId: +userId,
                     },
                  },
               }),
            },
         });

         const count = await this.prisma.posts.count({
            where: conditions,
         });

         return { posts, count };
      } catch (error) {
         throw error
      }
   }

   async recommendedPosts(userId: number | null, queryParameter: { [key: string]: string }) {
      try {
         const { page = 1, limit = 25, search = '', sortColumn = 'createdAt', sortOrder = 'desc', post_type = "post" } = queryParameter
         const conditions: any = {}
         if (search) {
            conditions.OR = [
               { name: { contains: search, mode: "insensitive" } },
               { slug: { contains: search, mode: "insensitive" } },
            ]
         }
         conditions.type = post_type
         conditions.status = 'published'

         const query: any = {}
         if (sortColumn && sortOrder) {
            query.orderBy = { [sortColumn]: sortOrder }
         }
         const posts = await this.prisma.posts.findMany({
            where: conditions,
            take: +limit,
            skip: (+page - 1) * +limit,
            ...query,
            include: {
               author: {
                  select: {
                     id: true,
                     name: true,
                     display_name: true,
                     username: true,
                  },
               },
               categories: {
                  select: {
                     taxonomy: {
                        select: {
                           id: true,
                           name: true,
                           slug: true,
                        }
                     },
                  }
               },
               ...(userId !== null && {
                  savedPosts: {
                     where: {
                        userId: +userId,
                     },
                  },
               }),
            },
         });

         return posts
      } catch (error) {
         throw error
      }
   }

   async bookmarkPost(postId: string | number, userId: number, save: boolean) {
      try {
         if (save) {
            const newBookmark = await this.prisma.savedPosts.create({
               data: { postId: +postId, userId: +userId }
            })
            if (newBookmark) {
               await this.prisma.posts.update({
                  where: { id: +postId },
                  data: {
                     save_count: {
                        increment: 1,
                     },
                  },
               });
            }
            return true
         } else {
            const bookmark = await this.prisma.savedPosts.delete({
               where: {
                  userId_postId: { userId: +userId, postId: +postId }
               }
            })
            if (bookmark) {
               await this.prisma.posts.update({
                  where: { id: +postId },
                  data: {
                     save_count: {
                        decrement: 1,
                     },
                  },
               });
            }
            return false
         }

      } catch (error) {
         throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, success: false, message: 'Internal Server Error', error: error }, HttpStatus.INTERNAL_SERVER_ERROR)
      }
   }

   async createPostComment(body) {
      const { postId, userId, content, parentId = null } = body;
      const newComment = await this.prisma.comment.create({
         data: {
            postId: +postId,
            userId: +userId,
            content: content,
            parentId: parentId ? +parentId : null,
         }
      })
      if (!newComment) {
         throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'Comment Not Created' }, HttpStatus.CONFLICT)
      }
      return newComment;
   }

   async publicPostComment(id: string) {
      const comment = await this.prisma.comment.findMany({
         where: {
            postId: +id,
            parentId: null
         },
         include: {
            user: {
               select: {
                  id: true,
                  name: true,
                  display_name: true,
                  username: true,
                  avatar: true
               }
            },
            replies: {
               include: {
                  user: {
                     select: {
                        id: true,
                        name: true,
                        display_name: true,
                        username: true,
                        avatar: true
                     }
                  },
                  replies: { // Nested replies (depth: 2)
                     include: {
                        user: {
                           select: {
                              id: true,
                              name: true,
                              display_name: true,
                              username: true,
                              avatar: true
                           }
                        },
                        replies: true, // Nested replies (depth: 3) if needed
                     }
                  }
               }
            }
         },
         orderBy: {
            createdAt: "desc",
         },
      })
      if (!comment) {
         throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'Comments Not Found' }, HttpStatus.CONFLICT)
      }
      return comment;
   }

   async likePost(userId: number, postId: number, like: boolean = false) {
      try {
         if (like) {
            const newLike = await this.prisma.likePost.create({
               data: { userId: +userId, postId: +postId }
            })
            if (newLike) {
               await this.prisma.posts.update({
                  where: { id: +postId },
                  data: {
                     like_count: {
                        increment: 1,
                     },
                  },
               });
            }
            return true
         } else {
            const deleteLike = await this.prisma.likePost.delete({
               where: {
                  userId_postId: { userId: +userId, postId: +postId }
               }
            })
            if (deleteLike) {
               await this.prisma.posts.update({
                  where: { id: +postId },
                  data: {
                     like_count: {
                        decrement: 1,
                     },
                  },
               });
            }
            return false;
         }
      } catch (error) {
         throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, success: false, message: 'Internal Server Error', error: error }, HttpStatus.INTERNAL_SERVER_ERROR)
      }
   }


   async posts(queryParameter: { [key: string]: any }) {
      try {
         const {
            page = 1,
            limit = 25,
            search = '',
            sortColumn = 'createdAt',
            sortOrder = 'desc',
            type = "post",
            status = 'all',
            author,
            author_in = [],
            categories = [],
            categories_out = []
         } = queryParameter
         const conditions: any = {}
         conditions.type = type
         if (search) {
            conditions.OR = [
               { title: { contains: search, mode: "insensitive" } },
               { slug: { contains: search, mode: "insensitive" } },
            ]
         }
         if (status !== 'all') {
            conditions.status = status;
         }
         if (author) {
            conditions.authorId = author;
         }
         if (author_in.length > 0) {
            conditions.authorId = { in: author_in };
         }
         // category filter or include all categories
         if (categories.length > 0) {
            conditions.categories = {
               some: { taxonomyId: { in: categories } }
            }
         }
         // exclude categories or exclude all categories except specified categories
         if (categories_out.length > 0) {
            conditions.categories = {
               none: { taxonomyId: { in: categories_out } }
            }
         }

         const query: any = {}
         if (sortColumn && sortOrder) {
            query.orderBy = { [sortColumn]: sortOrder }
         }
         const posts = await this.prisma.posts.findMany({
            where: conditions,
            take: +limit,
            skip: (+page - 1) * +limit,
            ...query,
            include: {
               author: {
                  select: {
                     id: true,
                     name: true,
                     display_name: true,
                     username: true,
                  }
               },
               categories: {
                  select: {
                     taxonomy: {
                        select: {
                           id: true,
                           name: true,
                           slug: true,
                        }
                     },
                  }
               },
            },
         });

         const count = await this.prisma.posts.count({
            where: conditions,
         });

         return { posts, count };
      } catch (error) {
         throw error
      }
   }

   async adminPosts(queryParameter: { [key: string]: any }) {
      try {
         const {
            page = 1,
            limit = 25,
            search = '',
            sortColumn = 'createdAt',
            sortOrder = 'desc',
            type = "post",
            status = [],
            author_in = [],
            categories = [],
            categories_out = []
         } = queryParameter
         const conditions: any = {}
         conditions.type = type
         if (search) {
            conditions.OR = [
               { title: { contains: search, mode: "insensitive" } },
               { slug: { contains: search, mode: "insensitive" } },
            ]
         }
         if (status.length > 0) {
            conditions.status = { in: status }
         }
         if (author_in.length > 0) {
            conditions.authorId = { in: author_in };
         }
         // category filter or include all categories
         if (categories.length > 0) {
            conditions.categories = {
               some: { taxonomyId: { in: categories } }
            }
         }
         // exclude categories or exclude all categories except specified categories
         if (categories_out.length > 0) {
            conditions.categories = {
               none: { taxonomyId: { in: categories_out } }
            }
         }

         const query: any = {}
         if (sortColumn && sortOrder) {
            query.orderBy = { [sortColumn]: sortOrder }
         }
         const posts = await this.prisma.posts.findMany({
            where: conditions,
            take: +limit,
            skip: (+page - 1) * +limit,
            ...query,
            include: {
               author: {
                  select: {
                     id: true,
                     name: true,
                     display_name: true,
                     username: true,
                  }
               },
               categories: {
                  select: {
                     taxonomy: {
                        select: {
                           id: true,
                           name: true,
                           slug: true,
                        }
                     },
                  }
               },
            },
         });

         const count = await this.prisma.posts.count({
            where: conditions,
         });

         return { posts, count };
      } catch (error) {
         throw error
      }
   }

   // ############################  old ############################################
   // #############################################################################

   async slugAvailability(slug: string) {
      try {
         const existingPost = await this.prisma.posts.findUnique({
            where: {
               slug
            },
            select: {
               id: true,
               slug: true
            }
         });
         return existingPost;
      } catch (error) {
         throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, success: false, message: 'Internal Server error', error: error }, HttpStatus.INTERNAL_SERVER_ERROR)
      }
   }

   async createPost(body: { [key: string]: any }) {

      const { title, slug = '', content, type = 'post', status = 'draft', meta_title = '', meta_description = '', authorId, thumbnail = '', categories = [], headings_list = [] } = body

      const createSlug = slug || title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

      const existingPost = await this.prisma.posts.findUnique({
         where: {
            slug: createSlug
         }
      });
      if (existingPost) {
         throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'Slug already exist' }, HttpStatus.CONFLICT)
      }

      const newPost = await this.prisma.posts.create({
         data: {
            title: title,
            slug: createSlug,
            content: content,
            type: type,
            status: status,
            meta_title: meta_title,
            meta_description: meta_description,
            thumbnail: thumbnail,
            authorId: +authorId,
            headings_list: headings_list,
            categories: {
               create: categories?.map((id: number) => ({
                  taxonomy: { connect: { id: id } },
               })),
            }
         }
      })

      if (!newPost) {
         throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'Post Not Created' }, HttpStatus.CONFLICT)
      }

      return newPost;

   }

   async readPost(id: string) {
      const post = await this.prisma.posts.findUnique({
         where: {
            id: +id
         },
         include: {
            categories: true
         }
      })
      if (!post) {
         throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'Post Not Found' }, HttpStatus.CONFLICT)
      }
      return post;
   }
   // ##############################################################




   // #############################################################
   async readPostForAdmin(id: string) {
      const post = await this.prisma.posts.findUnique({
         where: {
            id: +id
         },
         include: {
            author: {
               select: {
                  id: true,
                  name: true,
                  display_name: true,
                  username: true,
               }
            },
            categories: {
               select: {
                  taxonomy: {
                     select: {
                        id: true,
                        name: true,
                        slug: true,
                     }
                  },
               }
            },
         },
      })
      if (!post) {
         throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'Post Not Found' }, HttpStatus.CONFLICT)
      }
      return post;
   }

   async updatePost(id: number, body: { [key: string]: any }) {
      const { slug, authorId, categories = [], tags = [], ...rest } = body

      const checkSlug = await this.prisma.posts.findUnique({
         where: {
            slug: slug,
            NOT: { id: +id }
         }
      })
      if (checkSlug && checkSlug.id !== +id) {
         throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'Slug already exist' }, HttpStatus.CONFLICT)
      }

      const updatePost = await this.prisma.posts.update({
         where: { id: +id },
         data: {
            slug,
            ...rest,
            authorId: +authorId,
            categories: {
               create: categories.map((id: number) => ({
                  taxonomy: { connect: { id: id } },
               }))
            }
         }
      })
   }

   async changeStatusPost(id: string, status: string) {
      const post = await this.prisma.posts.update({
         where: {
            id: +id
         },
         data: {
            status: status || "draft"
         },
         select: {
            id: true,
            title: true,
            status: true
         }
      })
      if (!post) {
         throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, success: false, message: 'Failed to change status' }, HttpStatus.INTERNAL_SERVER_ERROR)
      }
      return post;
   }

   async draftContent(body: { [key: string]: any }) {

      const { id, title = '', content = '', headings_list = [], type = 'post', authorId } = body

      if (id) {
         const updatePost = await this.prisma.posts.update({
            where: {
               id: +id,
            },
            data: {
               title,
               content,
               headings_list
            }
         })
         if (!updatePost) {
            throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, success: false, message: 'Failed to update post' }, HttpStatus.INTERNAL_SERVER_ERROR)
         }
         return updatePost;
      } else {
         const createSlug = title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
         const existingPost = await this.prisma.posts.findUnique({
            where: {
               slug: createSlug
            }
         });
         if (existingPost) {
            throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'Slug already exist' }, HttpStatus.CONFLICT)
         }
         const newPost = await this.prisma.posts.create({
            data: {
               title,
               slug: createSlug,
               content,
               type,
               status: 'draft',
               authorId: +authorId
            }
         })
         if (!newPost) {
            throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, success: false, message: 'Failed to create post' }, HttpStatus.INTERNAL_SERVER_ERROR)
         }
         return newPost;
      }
   }

   async createDraftPost(body: { [key: string]: any }) {
      const { title, slug = '', content, type = 'post', meta_title = '', meta_description = '', authorId, thumbnail = '', categories = [], headings_list = [] } = body

      const createSlug = slug || title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

      const existingPost = await this.prisma.posts.findUnique({
         where: {
            slug: createSlug
         }
      });
      if (existingPost) {
         throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'Slug already exist' }, HttpStatus.CONFLICT)
      }
      const newPost = await this.prisma.posts.create({
         data: {
            title: title,
            slug: createSlug,
            content: content,
            type: type,
            status: 'draft',
            meta_title: meta_title,
            meta_description: meta_description,
            thumbnail: thumbnail,
            authorId: +authorId,
            headings_list: headings_list,
            categories: {
               create: categories?.map((id: number) => ({
                  taxonomy: { connect: { id: id } },
               })),
            }
         }
      })
      if (!newPost) {
         throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'Post Not Created' }, HttpStatus.CONFLICT)
      }
      return newPost;
   }


   // #################################################################


   async demoPost() {

      for (const blog of blogsList) {
         await this.prisma.posts.create({
            data: {
               title: blog.title,
               slug: blog.slug,
               content: blog.content,
               type: 'article',
               status: 'published',
               thumbnail: `posts/${thumbnailList[blog.id].file_name}`,
               authorId: +blog.author_id,
               categories: {
                  create: blog.categories?.map((id: number) => ({
                     taxonomy: { connect: { id: id } },
                  })),
               }
            }
         })

      }



      return true

   }

}