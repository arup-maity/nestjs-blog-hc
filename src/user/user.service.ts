import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FilterQueryDto } from './dto/user.validation';

@Injectable()
export class UserService {
   constructor(private prisma: PrismaService) { }

   async profileUpdate(id: string, userData: any) {
      if (userData?.username) {
         const findUser = await this.prisma.users.findUnique({
            where: {
               username: userData?.username,
               NOT: { id: +id },
            }
         })
         if (findUser) {
            throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'Username already exists' }, HttpStatus.CONFLICT)
         }
      }
      if (userData?.email) {
         const findUser = await this.prisma.users.findUnique({
            where: {
               email: userData?.email,
               NOT: { id: +id },
            }
         })
         if (findUser) {
            throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'Email already exists' }, HttpStatus.CONFLICT)
         }
      }
      const user = await this.prisma.users.update({
         where: { id: +id },
         data: userData,
      })
      if (!user) {
         throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, success: false, message: 'Failed to update user' }, HttpStatus.INTERNAL_SERVER_ERROR)
      }
      return user;
   }

   async profileAvatarUpdate(userId: number, url: string): Promise<any> {
      try {
         const updateProfile = await this.prisma.users.update({
            where: { id: +userId },
            data: { avatar: url },
         })
         return updateProfile
      } catch (error) {
         throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, success: false, message: 'Internal server error', error }, HttpStatus.INTERNAL_SERVER_ERROR)
      }
   }

   async profileDetails(id: number) {
      const user = await this.prisma.users.findUnique({
         where: { id: +id },
         include: {
            userMeta: true
         }
      })
      if (!user) {
         throw new HttpException({ status: HttpStatus.NOT_FOUND, success: false, message: 'User not found' }, HttpStatus.NOT_FOUND)
      }
      return user;
   }

   async authorProfile(username: string) {
      try {
         const user = await this.prisma.users.findUnique({
            where: { username: username },
         })
         return user;
      } catch (error) {
         throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, success: false, message: 'Internal server error', error }, HttpStatus.INTERNAL_SERVER_ERROR)
      }
   }

   async updateAuthorFollower(followerId: number, followingId: number, follow: boolean) {
      try {
         if (follow) {
            const result = await this.prisma.follower.create({
               data: {
                  followerId,
                  followingId,
               }
            });
            return result
         } else {
            const result = await this.prisma.follower.delete({
               where: {
                  followerId_followingId: {
                     followerId,
                     followingId,
                  },
               },
            });
            return result
         }
      } catch (error) {
         throw new HttpException({
            status: HttpStatus.INTERNAL_SERVER_ERROR, success: false, message: 'Internal servar errror', error
         }, HttpStatus.INTERNAL_SERVER_ERROR)
      }
   }

   async checkAuthorFollow(userId: number, authorid: string) {
      const result = await this.prisma.follower.findUnique({
         where: {
            followerId_followingId: { followerId: +userId, followingId: +authorid },
         }
      })
      return !!result
   }

   async checkPostLike(userId: number, postId: string) {
      const result = await this.prisma.likePost.findUnique({
         where: {
            userId_postId: { userId: +userId, postId: +postId },
         }
      })
      return !!result
   }

   async checkPostBookmark(userId: number, postId: string) {
      const result = await this.prisma.savedPosts.findUnique({
         where: {
            userId_postId: { userId: +userId, postId: +postId },
         }
      })
      return !!result
   }

   async savedPosts(userId: number, queryParameter: any) {
      const {
         page = 1,
         limit = 25,
         sortColumn = 'createdAt',
         sortOrder = 'desc',
         type = "article",
         category = 'all'
      } = queryParameter

      const whereCondition: any = {
         userId: +userId,
         post: {
            type: type
         }
      };
      if (category && category !== 'all') {
         whereCondition.post.categories = {
            some: {
               taxonomyId: +category
            }
         };
      }

      const savedPosts = await this.prisma.savedPosts.findMany({
         where: whereCondition,
         include: {
            post: {
               select: {
                  id: true,
                  title: true,
                  slug: true,
                  excerpt: true,
                  type: true,
                  thumbnail: true,
                  createdAt: true,
                  // categories: {
                  //    select: {
                  //       taxonomy: {
                  //          select: {
                  //             id: true,
                  //             name: true,
                  //             slug: true,
                  //          }
                  //       }
                  //    }
                  // },
                  author: {
                     select: {
                        id: true,
                        name: true,
                        username: true
                     }
                  }
               }
            }
         },
         take: +limit,
         skip: (+page - 1) * +limit,
         orderBy: { [sortColumn]: sortOrder === 'asc' ? 'asc' : 'desc' },
      })
      return savedPosts
   }

   // ##############################  old ###########################
   // ####################################################################
   async getUserById(id: string) {
      return await this.prisma.users.findUnique({
         where: { id: +id },
         include: {
            userMeta: true
         }
      })
   }
   async updateUser(id: string, user: any) {
      const { isActive, ...rest } = user
      return await this.prisma.users.update({
         where: { id: +id },
         data: {
            isActive: isActive === 'active' ? true : false,
            ...rest
         }
      });
   }



   async filterUserList(queryParameter: FilterQueryDto) {
      const { page = 1, limit = 25, search = '', sortColumn = 'createdAt', sortOrder = 'desc', role = 'all' } = queryParameter
      const conditions: any = {}
      if (search) {
         conditions.OR = [
            { email: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
         ]
      }
      if (role !== 'all') {
         conditions.role = {
            in: role
         }
      }
      const query: any = {}
      if (sortColumn && sortOrder) {
         query.orderBy = { [sortColumn]: sortOrder }
      }
      const users = await this.prisma.users.findMany({
         where: conditions,
         take: +limit,
         skip: (+page - 1) * +limit,
         ...query,
      });

      return users;
   }

   // ############################# Become Author #############################
   async becomeAuthorApplication(id: number, data: any) {
      const { categories, ...rest } = data
      const checkUser = await this.prisma.becomeAuthor.findUnique({
         where: { userId: +id },
      })
      if (checkUser) {
         throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'User has already applied for becoming an author' }, HttpStatus.CONFLICT)
      }
      const application = await this.prisma.becomeAuthor.create({
         data: {
            userId: +id,
            ...rest,
            categories: {
               create: categories?.map((categoryId: number) => ({
                  category: { connect: { id: categoryId } },
                  user: { connect: { id: +id } }
               })),
            }
         }
      });
      if (!application) {
         throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, success: false, message: 'Failed to create become author application' }, HttpStatus.INTERNAL_SERVER_ERROR)
      }
      return application;
      return ''
   }

   async checkAuthorApplication(id: number) {
      try {
         const author = await this.prisma.becomeAuthor.findUnique({
            where: { userId: +id },
            select: {
               status: true
            }
         })
         return author;
      } catch (error) {
         throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, success: false, message: 'Internal server error', error }, HttpStatus.INTERNAL_SERVER_ERROR)
      }
   }

   async readBecomeAuthor(id: string) {
      const author = await this.prisma.becomeAuthor.findUnique({
         where: { userId: +id },
         include: {
            user: true
         }
      })
      if (!author) {
         throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'Become author application not found' }, HttpStatus.CONFLICT)
      }
      return author;
   }

   async updateBecomeAuthor(id: string, status: any) {
      const author = await this.prisma.becomeAuthor.update({
         where: { userId: +id },
         data: {
            status: status
         }
      });
      if (!author) {
         throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, success: false, message: 'Failed to update become author application' }, HttpStatus.INTERNAL_SERVER_ERROR)
      }
      const updateUser = await this.prisma.users.update({
         where: {
            id: +id
         },
         data: {
            is_author: status === 'approved' ? true : false
         }
      })
      if (!updateUser) {
         throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, success: false, message: 'Failed to update user author status' }, HttpStatus.INTERNAL_SERVER_ERROR)
      }
      return author;
   }

   async becomeAuthorList(queryParameter: FilterQueryDto) {
      const { page = 1, limit = 25, search = '', sortColumn = 'createdAt', sortOrder = 'desc' } = queryParameter
      const conditions: any = {}
      if (search) {
         conditions.OR = [
            { email: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
         ]
      }
      const query: any = {}
      if (sortColumn && sortOrder) {
         query.orderBy = { [sortColumn]: sortOrder }
      }
      const applications = await this.prisma.becomeAuthor.findMany({
         where: conditions,
         include: {
            user: true
         },
         take: +limit,
         skip: (+page - 1) * +limit,
         ...query,
      })
      if (!applications) {
         throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, success: false, message: 'Failed to fetch become author applications' }, HttpStatus.INTERNAL_SERVER_ERROR)
      }
      return applications;
   }


   // async demoUser() {
   //    try {
   //       let insertedCount = 0;
   //       for (let user of userList) {
   //          await this.prisma.users.create({
   //             data: {
   //                name: user.name,
   //                email: user.email,
   //                username: user.username,
   //                role: 'user',
   //                userPassword: {
   //                   create: {
   //                      method: "password",
   //                      password: user.password
   //                   }
   //                }
   //             }
   //          })
   //          insertedCount++
   //       }
   //       console.log(insertedCount)
   //    } catch (error) {
   //       console.log(error)
   //    }
   // }
}