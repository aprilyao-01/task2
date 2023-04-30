library(ggplot2)
library(tidyverse)
library(dplyr)


# Use visual analytics to show uncertainty in the data. 
# Compare the reliability of neighborhood reports. 
# Which neighborhoods are providing reliable reports? 
# Provide a rationale for your response.

##########################################
#Load data 
#########################################
# Loading data
data <- read.csv("../mc1-reports-data.csv")
head(data)

#########################################
# Data parse
########################################
# extract date and time as separate columns
data$date <- as.Date(data$time)
data$time <- format(as.POSIXct(data$time), format = "%H:%M")

# reformat date and time as mm-dd h:m
data$dateNTime <- paste(format(data$date, format = "%m-%d"), data$time, sep = " ")

# create a new column to represent the reliability of neighborhood reports
data$reliability <- apply(data[,c(2:6)], 1, function(x) sum(!is.na(x))/5)

# Compute the number of reports per location
reports_per_location <- data %>% 
  group_by(location) %>% 
  summarise(num_reports = n())

# Compute the number of reports with missing data per location
missing_reports_per_location <- data %>% 
  group_by(location) %>% 
  summarise(num_missing_reports = sum(is.na(shake_intensity)))

# Compute the percentage of missing reports per location
reliability_data <- reports_per_location %>% 
  left_join(missing_reports_per_location, by = "location") %>% 
  mutate(percent_missing = num_missing_reports / num_reports * 100) %>%
  mutate(percent_reliable = 100 - percent_missing)

#Write as a new csv file
write.csv(reliability_data, "reliability_data.csv", row.names = FALSE)

# Sort the locations by reliability
reliability_data <- reliability_data[order(reliability_data$percent_missing),]


#########################################
# Data visualisation
########################################

# Generate scatter plot with color by location
ggplot(data, aes(x = shake_intensity, y = buildings, colour = as.factor(location))) +
  geom_point() +
  ggtitle("Correlation Between Shake Intensity and Reported Damage to Buildings by Neighborhood") +
  labs(x = "Shake Intensity", y = "Reported Damage to Buildings", color="Neighborhood") +
  theme_bw() +
  theme(legend.position = "bottom")

#############################
# create the scatter plot
ggplot(data, aes(x=shake_intensity, y=buildings, colour=as.factor(location))) +
  geom_point() +
  theme_minimal() +
  labs(title="Correlation between Shake Intensity and Reported Building Damage by Neighborhood", 
       x="Shake Intensity", y="Reported Building Damage", color="Neighborhood") +
  #geom_smooth(method="lm", se=FALSE) +
  facet_wrap(~location)

###################
# Create a bar plot of reliability by location
ggplot(reliability_data, aes(x = location, y = percent_missing)) +
  geom_bar(stat = "identity") +
  labs(x = "Location", y = "Percent of Missing Reports", 
       title = "Percentage of Missing Reports by Location") +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 90, hjust = 1))

###################