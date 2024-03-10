# Use the official Gradle image to build your application
FROM gradle:8.6.0-jdk17 as build

# Set the working directory in the Docker image
WORKDIR /home/gradle/src

# Copy the Gradle configuration files separately to leverage Docker cache
COPY --chown=gradle:gradle build.gradle /home/gradle/src/
COPY --chown=gradle:gradle settings.gradle /home/gradle/src/

# Copy the project source
COPY --chown=gradle:gradle . /home/gradle/src

# Build the application
RUN gradle build --no-daemon

# Use OpenJDK image to run the Spring Boot application
FROM openjdk:17

# Set deployment directory
WORKDIR /app

# Copy the JAR file from the build stage to the deployment container
COPY --from=build /home/gradle/src/build/libs/*.jar /app/spring-boot-application.jar

# Expose the port the app runs on
EXPOSE 8080

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "spring-boot-application.jar"]
