package com.fabiansimon.fanio.utils;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.List;

public class PythonScriptRunner {
    static public String run(String scriptName, String input) throws Exception {
        String homeDirectory = System.getProperty("user.home");
        String path = homeDirectory + "/Developer/python_scripts/" + scriptName + ".py";

        /*  TODO:
            Handle Command Injection Vulnerability
         */

        List<String> commands = List.of("/Users/fabiansimon/opt/anaconda3/bin/python3", path, input);
        ProcessBuilder processBuilder = new ProcessBuilder(commands);
        processBuilder.redirectErrorStream(true);
        Process process = processBuilder.start();

        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        StringBuilder output = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            output.append(line);
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new Exception("Python Script Error");
        }

        return output.toString();
    }
}
