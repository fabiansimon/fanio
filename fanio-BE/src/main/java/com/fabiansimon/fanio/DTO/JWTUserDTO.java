package com.fabiansimon.fanio.DTO;

import com.fabiansimon.fanio.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class JWTUserDTO {
    String jwt;
    User user;
}
