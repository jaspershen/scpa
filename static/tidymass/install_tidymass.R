install_tidymass <-
  function(packages = c("core", "all"),
           which_package,
           from = c("gitlab", "github", "gitee", "shen"),
           method = c("auto", "internal", "libcurl",
                      "wget", "curl")) {
    packages <- match.arg(packages)
    from <- match.arg(from)
    method <- match.arg(method)
    
    temp_path <- tempdir()
    dir.create(temp_path, showWarnings = FALSE, recursive = TRUE)
    unlink(x = file.path(temp_path, dir(temp_path)),
           recursive = TRUE,
           force = TRUE)
    if (from == "gitee") {
      file <-
        readr::read_csv(
          "https://gitee.com/tidymass/packages_repo/raw/main/packages/file.csv",
          show_col_types = FALSE
        )
    }
    
    if (from == "gitlab") {
      file <-
        readr::read_csv(
          "https://gitlab.com/tidymass/packages_repo/-/raw/main/packages/file.csv",
          show_col_types = FALSE
        )
    }
    
    if (from == "github") {
      file <-
        readr::read_csv(
          "https://raw.githubusercontent.com/tidymass/packages_repo/main/packages/file.csv",
          show_col_types = FALSE
        )
    }
    
    if (from == "shen") {
      utils::download.file(
        url = "https://scpa.netlify.app/tidymass/file.csv",
        destfile = file.path(temp_path, "file.csv"),
        method = method
      )
      file <-
        readr::read_csv(file.path(temp_path, "file.csv"),
                        show_col_types = FALSE)
    }
    
    core_package_list <-
      c(
        "masstools",
        "massdataset",
        "metid",
        "massstat",
        "massqc",
        "massprocesser",
        "masscleaner",
        "metpath",
        "tidymass"
      )
    
    if (!missing(which_package)) {
      package_list <-
        which_package
    } else{
      if (packages == "core") {
        package_list <-
          core_package_list
      } else{
        package_list <-
          c(core_package_list,
            "massconverter",
            "massdatabase")
      }
    }
    package_list %>%
      purrr::walk(function(x) {
        message("Install ", x, "...")
        ##install masstools first
        if (from == "github") {
          url <-
            paste0(
              "https://github.com/tidymass/packages_repo/raw/main/packages/",
              file$file_name.y[file$package == x]
            )
        }
        
        if (from == "gitlab") {
          url <-
            paste0(
              "https://gitlab.com/tidymass/packages_repo/-/raw/main/packages/",
              file$file_name.y[file$package == x],
              "?inline=false"
            )
        }
        
        if (from == "gitee") {
          url <-
            paste0(
              "https://gitee.com/tidymass/packages_repo/raw/main/packages/",
              file$file_name.y[file$package == x]
            )
        }
        
        if (from == "shen") {
          url <-
            paste0("https://scpa.netlify.app/tidymass/",
                   file$file_name.y[file$package == x])
        }
        
        utils::download.file(
          url = url,
          destfile = file.path(temp_path, file$file_name.y[file$package == x]),
          method = method
        )
        
        tryCatch(
          detach(name = paste0("package:", x)),
          error = function(e) {
            message(x, " in not loaded")
          }
        )
        
        remotes::install_deps(pkgdir = file.path(temp_path, file$file_name.y[file$package == x]), 
                              dependencies = TRUE, upgrade = "never")
        
        # install.packages(file.path(temp_path, file$file_name.y[file$package == x]),
        #                  repos = NULL,
        #                  type = "source")
        
        unlink(file.path(temp_path, file$file_name.y[file$package == x]))
      })
    message("All done.")
  }
